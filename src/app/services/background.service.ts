
import { Injectable, NgZone } from '@angular/core';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Platform } from '@ionic/angular';

import { Subscription } from 'rxjs';

import { AngularFireDatabase } from '@angular/fire/database';

import { UbicacionService } from './ubicacion.service';
import { FcmService } from './fcm.service';
import { UidService } from './uid.service';
import { ChatService } from './chat.service';

import { UnreadMsg } from '../interfaces/chat';
import { Notificacion, NotificacionDB } from '../interfaces/pedido';


@Injectable({
  providedIn: 'root'
})
export class BackgroundModeService {


  unreadSub: Subscription
  backSubscription: Subscription
  frontSubscription: Subscription

  isAsocidado = false

  hayPedidos = false
  unreads: UnreadMsg[] = []

  notificaciones: NotificacionDB[] = []

  constructor(
    private ngZone: NgZone,
    private platform: Platform,
    private db: AngularFireDatabase,
    public backgroundMode: BackgroundMode,
    private ubicacionService: UbicacionService,
    private chatService: ChatService,
    private uidService: UidService,
    private fcmService: FcmService,
  ) { }

  setAsociado(value: boolean) {
    this.isAsocidado = value
  }

  setPedidos(value: boolean) {
    this.hayPedidos = value
    if (this.hayPedidos) this.listenNewMsg()
    else if (this.unreadSub) this.unreadSub.unsubscribe()

  }

  async initBackgroundMode() {
    this.platform.ready().then(() => {
      this.backgroundMode.setDefaults({silent: true})
      this.ubicacionService.setInterval()
      this.backgroundMode.enable()
      this.setFrontMode()
      this.setBackMode()
      // this.backgroundMode.excludeFromTaskList()
    })
  }

  setBackMode() {
    if (this.backSubscription) this.backSubscription.unsubscribe()
    this.backSubscription =  this.backgroundMode.on('activate').subscribe(() => {
      this.ngZone.run(() => {
        if (this.isAsocidado) this.listenNotificationsOnBackground(true)
        this.backgroundMode.disableWebViewOptimizations()
        this.ubicacionService.clearInterval()
        this.ubicacionService.setInterval()
        if (this.hayPedidos) this.listenNewMsg()
        else if (this.unreadSub) this.unreadSub.unsubscribe()

      })
    })
  }

  listenNotificationsOnBackground(inBackground: boolean) {
    const uid = this.uidService.getUid()
    this.db.object(`notifications/${uid}`).query.ref.off('child_added')
    this.db.object(`notifications/${uid}`).query.ref.on('child_added', snap => {
      this.ngZone.run(() => {
        const notification: NotificacionDB = snap.val()
        if (this.notificaciones.length === 0) {
          this.fcmService.newNotification(notification, inBackground)
          this.notificaciones.push(notification)
        } else {
          const i = this.notificaciones.findIndex(n => n.idPedido === notification.idPedido)
          if (i < 0) {
            this.fcmService.newNotification(notification, inBackground)
            this.notificaciones.push(notification)
          }
        }
      })
    })
  }

  removeNotification(idPedido: string) {
    this.notificaciones = this.notificaciones.filter(n => n.idPedido !== idPedido)
  }

  setFrontMode() {
    if (this.frontSubscription) this.frontSubscription.unsubscribe()
    this.frontSubscription = this.backgroundMode.on('deactivate').subscribe(async () => {
      this.ngZone.run(() => {
        if (this.isAsocidado) {
          this.listenNotificationsOnBackground(false)
          // this.stopListenNotificationsBack()
          // this.fcmService.escuchaMensajes()
        }
        this.ubicacionService.clearInterval()
        this.ubicacionService.setInterval()
        if (this.hayPedidos) this.listenNewMsg()
        else if (this.unreadSub) this.unreadSub.unsubscribe()
      })
    })
  }

  stopListenNotificationsBack() {
    const uid = this.uidService.getUid()
    this.db.object(`notifications/${uid}`).query.ref.off('child_added')
  }

  listenNewMsg() {
    if (this.unreadSub) this.unreadSub.unsubscribe()
    this.unreadSub = this.chatService.listenMsg().subscribe((unreads: UnreadMsg[]) => {
      this.ngZone.run(() => {
        if (JSON.stringify(this.unreads) === JSON.stringify(unreads)) return
        if (this.unreads.length > unreads.length) return this.unreads = unreads
        this.fcmService.playMensaje()
        this.unreads = unreads
      })
    })
  }

  unlock() {
    this.backgroundMode.unlock()
  }

  deshabilitaBackground() {
    if (this.frontSubscription) this.frontSubscription.unsubscribe()
    if (this.backSubscription) this.backSubscription.unsubscribe()
    if (this.unreadSub) this.unreadSub.unsubscribe()
    this.backgroundMode.disable()
  }


}

