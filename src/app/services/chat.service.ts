import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Mensaje } from '../interfaces/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  listenMsg() {
    const idRepartidor = this.uidService.getUid()
    return this.db.list(`chat/${idRepartidor}/unread`).valueChanges()
  }

  setSeen(idPedido) {
    const idRepartidor = this.uidService.getUid();
    this.db.object(`chat/${idRepartidor}/unread/${idPedido}`).remove();
  }

  newMsg(idPedido) {
    const idRepartidor = this.uidService.getUid();
    return this.db.list(`chat/${idRepartidor}/todos/${idPedido}`)
  }

  listenStatus(idPedido) {
    const idRepartidor = this.uidService.getUid();
    return this.db.object(`chat/${idRepartidor}/status/${idPedido}`).valueChanges();
  }

  listenUnread(idPedido) {
    const idRepartidor = this.uidService.getUid();
    return this.db.object(`chat/${idRepartidor}/unread/${idPedido}`).valueChanges();
  }

  publicarMsg(idPedido: string, msg: Mensaje) {
    const idRepartidor = this.uidService.getUid();
    this.db.object(`chat/${idRepartidor}/status/${idPedido}`).remove();
    this.db.list(`chat/${idRepartidor}/todos/${idPedido}`).push(msg);
  }

}
