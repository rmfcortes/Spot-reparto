
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
import { stringify } from '@angular/compiler/src/util';


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
      this.setBackMode()
      this.setFrontMode()
      this.backgroundMode.enable()
      // this.backgroundMode.excludeFromTaskList()
    })
  }

  setBackMode() {
    if (this.backSubscription) { this.backSubscription.unsubscribe(); }
    this.backSubscription =  this.backgroundMode.on('activate').subscribe(() => {
      this.ngZone.run(() => {
        this.backgroundMode.disableWebViewOptimizations()
        if (this.isAsocidado) this.listenNotificationsOnBackground()
        this.ubicacionService.clearInterval()
        this.ubicacionService.setInterval()
        if (this.hayPedidos) this.listenNewMsg()
        else if (this.unreadSub) this.unreadSub.unsubscribe()

      })
    })
  }

  listenNotificationsOnBackground() {
    const uid = this.uidService.getUid()
    this.db.object(`notifications/${uid}`).query.ref.on('child_added', snap => {
      this.ngZone.run(() => {
        this.backgroundMode.unlock()
        const notification = snap.val()
        this.fcmService.newNotification(notification)
      })
    })
  }

  setFrontMode() {
    if (this.frontSubscription) this.frontSubscription.unsubscribe()
    this.frontSubscription = this.backgroundMode.on('deactivate').subscribe(async () => {
      this.ngZone.run(() => {
        if (this.isAsocidado) this.fcmService.escuchaMensajes()
        if (this.isAsocidado) this.stopListenNotificationsBack()
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

