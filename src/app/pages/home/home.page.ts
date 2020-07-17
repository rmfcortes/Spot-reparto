import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { PedidoPage } from 'src/app/modals/pedido/pedido.page';
import { ChatPage } from 'src/app/modals/chat/chat.page';

import { BackgroundModeService } from 'src/app/services/background.service';
import { PermissionsService } from 'src/app/services/permissions.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { CommonService } from 'src/app/services/common.service';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { FcmService } from 'src/app/services/fcm.service';
import { UidService } from 'src/app/services/uid.service';

import { Pedido, Cliente, Notificacion, Direccion } from 'src/app/interfaces/pedido';
import { UnreadMsg } from 'src/app/interfaces/chat';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy{

  pedidos: Pedido[] = []
  nombre: string

  msgSub: Subscription
  pedidosSub: Subscription
  permisosSub: Subscription

  pedidos_nuevos: Notificacion[] = []
  pedidos_nuevosSub: Subscription
  cuentaActiva = false

  esAsociado = false
  activo = false

  constructor(
    private router: Router,
    private callNumber: CallNumber,
    private modalCtrl: ModalController,
    private backgroundMode: BackgroundModeService,
    private permisosService: PermissionsService,
    private ubicacionService: UbicacionService,
    private commonService: CommonService,
    private pedidoService: PedidoService,
    private chatService: ChatService,
    private authService: AuthService,
    private uidService: UidService,
    private fcmService: FcmService,
  ) {}

    // Info inicial
  ngOnInit(): void {
    this.nombre = this.uidService.getNombre()
    this.getPedidos()
    this.listenPermisos()
    this.isAsociado()
    this.backgroundMode.initBackgroundMode()
  }

  isAsociado() {
    this.pedidoService.isAsociado()
    .then(async (resp) => {
      this.activo = resp
      this.esAsociado = true
      this.backgroundMode.setAsociado(true)
      this.fcmService.requestToken()
      this.fcmService.initAudio()
      this.listenPedidosNuevos()
    })
  }

    // Listeners

  listenPermisos() {
    this.permisosService.permisos.subscribe(permisos => {
      if (!permisos.token || !permisos.gps || !permisos.location || !permisos.fcm) {
        this.router.navigate(['/permisos'])
      }
    })
  }

  getPedidos() {
    this.pedidosSub = this.pedidoService.getPedidos().subscribe((pedidos: Pedido[]) => {
      this.pedidos = pedidos
      if (this.pedidos && this.pedidos.length > 0) this.listenNewMsg()
      else if (this.msgSub) this.msgSub.unsubscribe()
    })
  }

  listenNewMsg() {
    this.msgSub = this.chatService.listenMsg().subscribe((unReadmsg: UnreadMsg[]) => {
      this.pedidos.forEach(p => {
        const i = unReadmsg.findIndex(u => u.idPedido === p.id)
        if (i >= 0) p.unRead = unReadmsg[i].cantidad
        else p.unRead = 0
      })
    })
  }

  listenPedidosNuevos() { // if is Asociado Data
    this.pedidos_nuevosSub = this.fcmService.pedido_nuevo.subscribe(pedido => {
      if (pedido) {
        if (this.pedidos_nuevos.length === 0) {
          this.pedidos_nuevos.push(pedido)
        } else {
          const i = this.pedidos_nuevos.findIndex(p => p.idPedido === pedido.idPedido)
          if (i < 0) this.pedidos_nuevos.push(pedido)
        }
        if (!this.cuentaActiva) this.cuentaRegresiva()
      }
    })
  }

  // Acciones

  toogleActive(value: boolean) {
    if (this.pedidos.length > 0 && !value) {
      this.commonService.presentAlert('', 'Antes de pasar a Modo Inactivo, por favor completa todos tus servicios')
      .then(() => this.activo = true)
      return
    }
    if (value) {
      this.listenPedidosNuevos()
      this.listenPermisos()
      this.getPedidos()
    } else {
      this.cancelListeners()
      this.fcmService.cleanPedidoSub()
      this.pedidos_nuevos = []
    }
    this.pedidoService.setActivo(value)
  }

  llamar(numero) {
    this.callNumber.callNumber(numero, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.error(err))
  }

  async verPedido(pedido) {
    const modal = await this.modalCtrl.create({
      component: PedidoPage,
      componentProps: {pedido, esAsociado: this.esAsociado}
    })

    return await modal.present()
  }

  async verChat(idCliente: string, idPedido: string, nombreCliente: string) {
    const modal = await this.modalCtrl.create({
      component: ChatPage,
      componentProps: { idCliente, idPedido, nombreCliente }
    })

    return await modal.present()
  }

  verMapaNuevoPedido(i) {
    const direccion: Direccion = {
      direccion: this.pedidos_nuevos[i].cliente_direccion,
      lat:this.pedidos_nuevos[i].cliente_lat,
      lng:this.pedidos_nuevos[i].cliente_lng,
    }
    const cliente: Cliente = {
      direccion,
      nombre: this.pedidos_nuevos[i].cliente,
      uid: 'pendiente',
      pedido_nuevo: true
    }
    this.verMapa(cliente)
  }

  async verMapa(cliente: Cliente) {
    this.commonService.setClienteTemporal(cliente)
    this.router.navigate(['/mapa'])
  }

  tomarServicio(pedido: Notificacion) { // solo para Asociados
    this.pedidoService.tomarPedido(pedido)
    this.pedidos_nuevos = this.pedidos_nuevos.filter(p => p.idPedido !== pedido.idPedido)
  }
  
  // Auxiliar solo para Asociados
  cuentaRegresiva() {
    this.cuentaActiva = true
    setTimeout(() => {
      if (this.pedidos_nuevos.length === 0) {
        this.cuentaActiva = false
        this.fcmService.silenciar()
        return
      }
      for (const pedido of this.pedidos_nuevos) {
        const now = Date.now()
        const tolerancia = pedido.notificado + 40000
        pedido.segundos_left = (tolerancia - now) / 1000
        if (pedido.segundos_left <= 0) {
          this.pedidos_nuevos = this.pedidos_nuevos.filter(p => p.idPedido !== pedido.idPedido)
        }
      }
      this.cuentaRegresiva()
    }, 1000)
  }

  // Salida

  async cerrarSesion() {
    this.cancelListeners()
    await this.authService.logout()
    this.router.navigate(['/login'])
  }

  ngOnDestroy(): void {
    this.cancelListeners()
  }

  cancelListeners() {
    if (this.msgSub) this.msgSub.unsubscribe()
    if (this.pedidosSub) this.pedidosSub.unsubscribe()
    if (this.permisosSub) this.permisosSub.unsubscribe()
    if (this.pedidos_nuevosSub) this.pedidos_nuevosSub.unsubscribe()
    this.ubicacionService.clearInterval()
  }

}
