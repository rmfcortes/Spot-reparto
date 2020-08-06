import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { HomePage } from './home.page';
import { PedidoPageModule } from 'src/app/modals/pedido/pedido.module';
import { ChatPageModule } from 'src/app/modals/chat/chat.module';
import { NetworkModule } from 'src/app/shared/no-network.module';
import { ClienteCardModule } from 'src/app/shared/cliente-card.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetworkModule,
    ChatPageModule,
    PedidoPageModule,
    ClienteCardModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  providers: [CallNumber],
  declarations: [HomePage]
})
export class HomePageModule {}
