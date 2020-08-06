import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Pedido, Cliente } from 'src/app/interfaces/pedido';

@Component({
  selector: 'app-card-cliente',
  templateUrl: './card-cliente.component.html',
  styleUrls: ['./card-cliente.component.scss'],
})
export class CardClienteComponent implements OnInit {

  @Input() item: Pedido
  @Input() inPedido: boolean
  @Output() chat = new EventEmitter<any>(null)
  @Output() pedido = new EventEmitter<Pedido>(null)
  @Output() call = new EventEmitter<string>(null)
  @Output() map = new EventEmitter<Cliente>(null)

  constructor() { }

  ngOnInit() {}

  verMapa() {
    this.map.emit(this.item.cliente)
  }

  llamar() {
    this.call.emit(this.item.cliente.telefono)
  }

  verChat() {
    const value = {
      idCliente: this.item.cliente.uid,
      idPedido: this.item.id,
      nombreCliente: this.item.cliente.nombre
    }
    this.chat.emit(value)
  }

  verPedido() {
    this.pedido.emit(this.item)
  }

}
