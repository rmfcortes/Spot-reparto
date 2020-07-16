import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Pedido, Notificacion } from '../interfaces/pedido';
import { RepaAsociadoPreview } from '../interfaces/repa_asociado.interface';


@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  
  // isAsociado
  isAsociado(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      const region = this.uidService.getRegion()
      if (!region) {
        this.uidService.setAsociado(false)
        return reject(false)
      }
      const asocSub = this.db.object(`repartidores_asociados_info/${region}/preview/${uid}`).valueChanges()
      .subscribe((data: RepaAsociadoPreview) => {
        asocSub.unsubscribe()
        if (data) {
          this.uidService.setAsociado(true)
          resolve(data.activo)
        } else {
          this.uidService.setAsociado(false)
          reject(false)
        }  
      })
    });
  }

  getPedidos() {
    const idRepartidor = this.uidService.getUid()
    return this.db.list(`asignados/${idRepartidor}`).valueChanges()
  }

  tomarPedido(pedido: Notificacion) {
    const idRepartidor = this.uidService.getUid()
    pedido.region = this.uidService.getRegion()
    this.db.object(`pendientes_aceptacion/${idRepartidor}/${pedido.idPedido}`).set(pedido)
  }

  async tengoProductos(pedido: Pedido) {
    const idRepartidor = this.uidService.getUid()
    await this.db.object(`asignados/${idRepartidor}/${pedido.id}`).update(pedido)
  }

  async finalizarPedido(pedido: Pedido) {
    const idRepartidor = this.uidService.getUid()
    await this.db.object(`asignados/${idRepartidor}/${pedido.id}/entregado`).set(Date.now())
    this.db.object(`asignados/${idRepartidor}/${pedido.id}`).remove()
    this.db.object(`chat/${idRepartidor}/todos/${pedido.id}`).remove()
    this.db.object(`chat/${idRepartidor}/unread/${pedido.id}`).remove()
    this.db.object(`chat/${idRepartidor}/status/${pedido.id}`).remove()
  }

  setActivo(value: boolean) {
    const region = this.uidService.getRegion()
    const uid = this.uidService.getUid()
    this.db.object(`repartidores_asociados_info/${region}/preview/${uid}/activo`).set(value)
  }

}
