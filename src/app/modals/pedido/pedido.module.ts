import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { PedidoPage } from './pedido.page';
import { ConfirmarPagoPageModule } from '../confirmar-pago/confirmar-pago.module';
import { ChatPageModule } from '../chat/chat.module';
import { NetworkModule } from 'src/app/shared/no-network.module';
import { ClienteCardModule } from 'src/app/shared/cliente-card.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetworkModule,
    ChatPageModule,
    ClienteCardModule,
    ConfirmarPagoPageModule,
  ],
  declarations: [PedidoPage],
  entryComponents: [PedidoPage],
  providers: [CallNumber],
})
export class PedidoPageModule {}
