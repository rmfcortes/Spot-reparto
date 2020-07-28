import { Injectable, NgZone } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { FCM, NotificationData } from '@ionic-native/fcm/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';

import { AngularFireDatabase } from '@angular/fire/database';

import { UbicacionService } from './ubicacion.service';
import { CommonService } from './common.service';
import { UidService } from './uid.service';

import { Notificacion } from '../interfaces/pedido';


@Injectable({
  providedIn: 'root'
})
export class FcmService {

  token: string
  notifcationSub: Subscription

  pedido_nuevo = new BehaviorSubject<Notificacion>(null)

  constructor(
    private fcm: FCM,
    private ngZone: NgZone,
    private audio: NativeAudio,
    private db: AngularFireDatabase,
    private ubicacionService: UbicacionService,
    private commonService: CommonService,
    private uidService: UidService,
  ) {  }

  initAudio() {
    this.audio.preloadSimple('alerta', 'assets/sounds/loving-you.mp3')
  }

  requestToken() {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      const region = this.uidService.getRegion()
      if (this.token) {
        this.escuchaMensajes()
        return resolve()
      }
      this.fcm.getToken()
      .then(token => this.db.object(`repartidores_asociados_info/${region}/preview/${uid}/token`).set(token))
      .then(() => {
        this.escuchaMensajes()
        resolve()
      })
      .catch((error) => {
        reject(error)
      })
    });
  }

  escuchaMensajes() {
    this.notifcationSub = this.fcm.onNotification().subscribe((msg: NotificationData) => {
      this.ngZone.run(() => {
        if (msg.idPedido) this.newNotification(msg)
        this.fcm.clearAllNotifications()
        this.commonService.presentToast(msg.body)
      })
    })
  }

  async newNotification(notification) {
    const distancia = await this.ubicacionService.getDistancia(
      parseFloat(notification.negocio_lat),
      parseFloat(notification.negocio_lng)
    )
    const nuevo_pedido: Notificacion = {
      cliente: notification.cliente,
      idNegocio: notification.idNegocio,
      cliente_direccion: notification.cliente_direccion,
      cliente_lat: parseFloat(notification.cliente_lat),
      cliente_lng: parseFloat(notification.cliente_lng),
      createdAt: parseInt(notification.createdAt, 10),
      idPedido: notification.idPedido,
      negocio: notification.negocio,
      negocio_direccion: notification.negocio_direccion,
      negocio_lat: parseFloat(notification.negocio_lat),
      negocio_lng: parseFloat(notification.negocio_lng),
      notificado: parseInt(notification.notificado, 10),
      ganancia: parseInt(notification.ganancia, 10),
      propina: parseInt(notification.propina, 10),
      distancia
    }
    this.pedido_nuevo.next(nuevo_pedido)
    this.clearNotifications(nuevo_pedido.idPedido)
    this.audio.play('alerta')
  }

  cleanPedidoSub() {
    this.pedido_nuevo.next(null)
  }

  clearNotifications(idPedido: string) {
    const uid = this.uidService.getUid()
    this.db.object(`notifications/${uid}/${idPedido}`).remove()
  }

  silenciar() {
    this.audio.stop('alerta')
  }

  unsubscribeMensajes() {
    if (this.notifcationSub) this.notifcationSub.unsubscribe()
  }

}
