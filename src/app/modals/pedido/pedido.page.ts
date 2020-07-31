import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { ConfirmarPagoPage } from '../confirmar-pago/confirmar-pago.page';
import { ChatPage } from '../chat/chat.page';

import { AnimationService } from 'src/app/services/animation.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { CommonService } from 'src/app/services/common.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { AlertService } from 'src/app/services/alert.service';

import { Pedido, Cliente } from 'src/app/interfaces/pedido';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.page.html',
  styleUrls: ['./pedido.page.scss'],
})
export class PedidoPage implements OnInit, AfterViewInit {

  @Input() pedido: Pedido
  @Input() esAsociado: boolean

  msgSub: Subscription
  prodsReady = false

  constructor(
    private router: Router,
    private callNumber: CallNumber,
    private modalCtrl: ModalController,
    private animationService: AnimationService,
    private ubicacionService: UbicacionService,
    private commonService: CommonService,
    private pedidoService: PedidoService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.esAsociado) {
      if (!this.pedido.repartidor_llego) {
        return this.createBtn('llegue_btn', 'caja_llegue', 'llegue')
      }
      if (this.pedido.recolectado) {
        this.createBtn('boton', 'caja', 'entrega')
      } else {
        this.createBtn('recoleccion_btn', 'caja_recoleccion', 'recoleccion')
      }
    } else {
      this.createBtn('boton', 'caja', 'entrega')
    }
  }

  createBtn(idBtn: string, idCaja: string, origen: string) {
    const boton = document.getElementById(idBtn)
    const caja: HTMLElement = document.getElementById(idCaja)
    let cuenta
    if (this.pedido.formaPago.forma === 'efectivo' && origen === 'entrega') {
      cuenta = document.getElementById('cuenta')
      this.animationService.pulse(cuenta)
    }
    let width_caja = 0
    setTimeout(() => {
      width_caja = caja.clientWidth - 55
      this.animationService.arrastra(boton, width_caja)
      .then(() => {
        switch (origen) {
          case 'llegue':
            this.llegada()
            break          
          case 'recoleccion':
            this.recolectar()
            break
          case 'entrega':
            this.entregar()
            break
        }
      })
    }, 300)
  }

  llegada() {
    this.pedido.repartidor_llego = true
    this.pedidoService.llegue(this.pedido)
    setTimeout(() => {
      this.createBtn('recoleccion_btn', 'caja_recoleccion', 'recoleccion')
    }, 500)
  }

  readyToLeave() {
    this.prodsReady = true
    this.pedido.productos.forEach(p => p.checked ? null : this.prodsReady = false)
    console.log(this.prodsReady);
  }

  recolectar() {
    if (!this.prodsReady) {
      this.createBtn('recoleccion_btn', 'caja_recoleccion', 'recoleccion')
      this.alertService.presentAlert('', 'Tienes elementos pendientes en tu lista de productos. Por favor llena cada casilla de los productos que tengas en tus manos')
      return
    }
    this.pedido.recolectado = true
    this.pedidoService.tengoProductos(this.pedido)
    setTimeout(() => {
      this.createBtn('boton', 'caja', 'entrega')
    }, 500)
  }

  async verMapa(cliente: Cliente) {
    this.commonService.setClienteTemporal(cliente)
    this.router.navigate(['/mapa'])
    this.modalCtrl.dismiss()
  }

  navigate(lat: number, lng: number) {
    const numbers = [lat, lng]
    this.ubicacionService.navigate(numbers)
  }

  async entregar() {
    if (this.pedido.formaPago.forma === 'efectivo') {
      const modal = await this.modalCtrl.create({
        component: ConfirmarPagoPage,
        componentProps: {total: this.pedido.total}
      })

      modal.onWillDismiss().then(resp => {
        if (resp) {
          this.pedidoService.finalizarPedido(this.pedido)
          this.pedido = null
          setTimeout(() => this.regresar(), 500)
        }
      })
      return await modal.present()
    } else {
      this.pedidoService.finalizarPedido(this.pedido)
      this.regresar()
      this.pedido = null
    }
  }

  llamar(numero) {
    this.callNumber.callNumber(numero, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.error(err))
  }

  async verChat(idCliente: string, idPedido: string, nombreCliente: string) {
    const modal = await this.modalCtrl.create({
      component: ChatPage,
      componentProps: { idCliente, idPedido, nombreCliente }
    })

    return await modal.present()
  }

  regresar() {
    this.modalCtrl.dismiss()
    this.animationService.stopArrastra()
    this.animationService.stopPulse()
  }

}
