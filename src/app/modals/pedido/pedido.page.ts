import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { PedidoService } from 'src/app/services/pedido.service';

import { ConfirmarPagoPage } from '../confirmar-pago/confirmar-pago.page';

import { AnimationService } from 'src/app/services/animation.service';

import { Pedido } from 'src/app/interfaces/pedido';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.page.html',
  styleUrls: ['./pedido.page.scss'],
})
export class PedidoPage implements OnInit, AfterViewInit {

  @Input() pedido: Pedido;

  constructor(
    private modalCtrl: ModalController,
    private animationService: AnimationService,
    private pedidoService: PedidoService,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
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
