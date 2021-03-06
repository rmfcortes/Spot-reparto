import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UidService {

  uid: string
  nombre: string
  region: string
  asociado: boolean
  tolerancia: number

  public usuario = new BehaviorSubject(null)

  constructor() {  }

  setUid(uid) {
    this.uid = uid
    this.usuario.next(uid)
  }

  getUid() {
    return this.uid
  }

  setRegion(region) {
    this.region = region
  }

  getRegion() {
    return this.region
  }

  setNombre(nombre) {
    this.nombre = nombre
  }

  getNombre() {
    return this.nombre
  }

  setAsociado(asociado: boolean) {
    this.asociado = asociado
  }

  getAsociado() {
    return this.asociado
  }

  setTolerancia(tolerancia: number) {
    this.tolerancia = tolerancia
  }

  getTolerancia() {
    return this.tolerancia
  }

}
