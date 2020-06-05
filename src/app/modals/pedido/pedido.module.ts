import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PedidoPage } from './pedido.page';
import { ConfirmarPagoPageModule } from '../confirmar-pago/confirmar-pago.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmarPagoPageModule,
  ],
  declarations: [PedidoPage],
  entryComponents: [PedidoPage]
})
export class PedidoPageModule {}
