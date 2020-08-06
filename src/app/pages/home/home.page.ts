import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { PedidoPage } from 'src/app/modals/pedido/pedido.page';
import { ChatPage } from 'src/app/modals/chat/chat.page';

import { BackgroundModeService } from 'src/app/services/background.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { CommonService } from 'src/app/services/common.service';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { FcmService } from 'src/app/services/fcm.service';
import { UidService } from 'src/app/services/uid.service';

import { Pedido, Cliente, Notificacion, Direccion } from 'src/app/interfaces/pedido';
import { UnreadMsg } from 'src/app/interfaces/chat';
import { NetworkService } from 'src/app/services/network.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy{

  pedidos: Pedido[] = []
  nombre: string

  back: Subscription
  msgSub: Subscription
  pedidosSub: Subscription

  pedidos_nuevos: Notificacion[] = []
  pedidos_nuevosSub: Subscription
  cuentaActiva = false

  esAsociado = false
  activo = false
  reload = false

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private callNumber: CallNumber,
    private modalCtrl: ModalController,
    private backgroundMode: BackgroundModeService,
    private ubicacionService: UbicacionService,
    private commonService: CommonService,
    private pedidoService: PedidoService,
    private netService: NetworkService,
    private chatService: ChatService,
    private authService: AuthService,
    private uidService: UidService,
    private fcmService: FcmService,
  ) {}

    // Info inicial
  ngOnInit(): void {
    this.netService.checkNetStatus()
    this.init()
  }

  ionViewWillEnter() {
    if (this.reload) this.init()
    this.reload = false
    const pedido: Pedido = this.commonService.getPedidoTemporal()
    if (pedido) this.verPedido(pedido)
  }

  async init(event?) {
    this.pedidos = []
    this.pedidos_nuevos = []
    this.nombre = this.uidService.getNombre()
    this.backgroundMode.initBackgroundMode()
    await this.fcmService.initAudio()
    this.getPedidos(event)
    this.isAsociado()
  }

  isAsociado() {
    this.pedidoService.isAsociado()
    .then(async (resp) => {
      this.activo = resp
      this.esAsociado = true
      this.listenPedidosNuevos()
      this.fcmService.requestToken()
      this.backgroundMode.setAsociado(true)
      this.backgroundMode.listenNotificationsOnBackground(false)
    })
  }

    // Listeners

  getPedidos(event?) {
    if(this.pedidosSub) this.pedidosSub.unsubscribe()
    this.pedidosSub = this.pedidoService.getPedidos().subscribe((pedidos: Pedido[]) => {
      this.ngZone.run(() => {
        this.pedidos = pedidos
        if (this.pedidos && this.pedidos.length > 0) {
          this.listenNewMsg()
          this.backgroundMode.setPedidos(true)
          this.pedidos.forEach(ped => {
            const i = this.pedidos_nuevos.findIndex(p => p.idPedido === ped.id)
            if (i >= 0) this.pedidos_nuevos.splice(i, 1)
          })
        }
        else {
          this.backgroundMode.setPedidos(false)
          if (this.msgSub) this.msgSub.unsubscribe()
        }
        if (event) {
          event.target.complete()
          this.commonService.presentToast('Lista de pedidos actualizada')
        }
      })
    })
  }

  listenPedidosNuevos() { // if is Asociado Data
    this.pedidos_nuevosSub = this.fcmService.pedido_nuevo.subscribe(pedido => {
      this.ngZone.run(() => {
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
    })
  }

  listenNewMsg() {
    if (this.msgSub) this.msgSub.unsubscribe()
    this.msgSub = this.chatService.listenMsg().subscribe((unReadmsg: UnreadMsg[]) => {
      this.pedidos.forEach(p => {
        this.ngZone.run(() => {
          const i = unReadmsg.findIndex(u => u.idPedido === p.id)
          if (i >= 0) p.unRead = unReadmsg[i].cantidad
          else p.unRead = 0
        })
      })
    })
  }

  // Acciones

  toogleActive(value: boolean) {
    console.log('Toogle active');
    this.activo = value
    if (this.pedidos.length > 0 && !value) {
      this.commonService.presentAlert('', 'Antes de pasar a Modo Inactivo, por favor completa todos tus servicios')
      .then(() => this.activo = true)
      return
    }
    if (value) {
      this.listenPedidosNuevos()
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
    this.commonService.setPedidoTemporal(null)
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
      direccion: this.pedidos_nuevos[i].negocio_direccion,
      lat:this.pedidos_nuevos[i].negocio_lat,
      lng:this.pedidos_nuevos[i].negocio_lng,
    }
    const cliente: Cliente = {
      direccion,
      nombre: this.pedidos_nuevos[i].negocio,
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
    pedido.solicitado = true
    this.pedidoService.tomarPedido(pedido)
    this.listenRespuesta(pedido.idPedido)
  }

  listenRespuesta(idPedido: string) {
    this.pedidoService.listenRespuesta(idPedido).on('child_removed', snapshot => {
      this.ngZone.run(() => {
        this.pedidoService.listenRespuesta(idPedido).off('child_removed')
        this.backgroundMode.removeNotification(idPedido)
        const pedido: Notificacion = snapshot.val()
        setTimeout(() => {          
          const i = this.pedidos.findIndex(p => p.id === pedido.idPedido)
          if (i < 0) {
            this.commonService.presentToast('El pedido ha sido tomado por otro compañero')
            this.pedidos_nuevos = this.pedidos_nuevos.filter(p => p.idPedido !== pedido.idPedido)
          }
        }, 1500)
      })
    })

  }
  
  // Auxiliar solo para Asociados
  cuentaRegresiva() {
    this.cuentaActiva = true
    const espera = this.uidService.getTolerancia()
    setTimeout(() => {
      if (this.pedidos_nuevos.length === 0) {
        this.cuentaActiva = false
        this.fcmService.silenciar()
        return
      }
      for (const pedido of this.pedidos_nuevos) {
        if (pedido.solicitudes === 3) return
        const now = Date.now()
        const tolerancia = pedido.notificado + espera - 5000
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
    this.reload = true
    this.esAsociado = false
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
    if (this.pedidos_nuevosSub) this.pedidos_nuevosSub.unsubscribe()
    this.ubicacionService.clearInterval()
  }

}
