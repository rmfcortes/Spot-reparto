import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import { ConfirmarPagoPage } from '../confirmar-pago/confirmar-pago.page';

import { AnimationService } from 'src/app/services/animation.service';
import { PedidoService } from 'src/app/services/pedido.service';

import { Pedido } from 'src/app/interfaces/pedido';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.page.html',
  styleUrls: ['./pedido.page.scss'],
})
export class PedidoPage implements OnInit, AfterViewInit {

  @Input() pedido: Pedido;
  @Input() esAsociado: boolean;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private animationService: AnimationService,
    private commonService: CommonService,
    private pedidoService: PedidoService,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.pedido.recolectado) {
      this.entregarBtn()
    } else {
      const boton = document.getElementById('rec')
      const caja: HTMLElement = document.getElementById('caja_rec')
      let width_caja = 0
      setTimeout(() => {
        width_caja = caja.clientWidth - 55
        this.animationService.arrastra(boton, width_caja)
        .then(() => this.recolectar())
      }, 300)
    }
  }

  entregarBtn() {
    const boton = document.getElementById('boton')
    const caja: HTMLElement = document.getElementById('caja')
    let cuenta
    if (this.pedido.formaPago.forma === 'efectivo') {
      cuenta = document.getElementById('cuenta')
      this.animationService.pulse(cuenta)
    }
    let width_caja = 0
    setTimeout(() => {
      width_caja = caja.clientWidth - 55
      this.animationService.arrastra(boton, width_caja)
      .then(() => this.entregar())
    }, 300)
  }

  recolectar() {
    this.pedido.recolectado = true
    this.pedidoService.tengoProductos(this.pedido)
    setTimeout(() => {
      this.entregarBtn()
    }, 500)
  }

  async verMapa() {
    this.commonService.setClienteTemporal(this.pedido.cliente)
    this.router.navigate(['/mapa'])
    this.modalCtrl.dismiss()
  }

  async entregar() {
    if (this.pedido.formaPago.forma === 'efectivo') {
      const modal = await this.modalCtrl.create({
        component: ConfirmarPagoPage,
        componentProps: {total: this.pedido.total}
      })

      modal.onDidDismiss().then(resp => {
        if (resp) {
          this.pedidoService.finalizarPedido(this.pedido)
          this.regresar()
          this.pedido = null
        }
      })
      return await modal.present()
    } else {
      this.pedidoService.finalizarPedido(this.pedido)
      this.regresar()
      this.pedido = null
    }
  }

  regresar() {
    this.modalCtrl.dismiss()
    this.animationService.stopArrastra()
    this.animationService.stopPulse()
  }

}
