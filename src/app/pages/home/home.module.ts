import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { HomePage } from './home.page';
import { PedidoPageModule } from 'src/app/modals/pedido/pedido.module';
import { ChatPageModule } from 'src/app/modals/chat/chat.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageModule,
    PedidoPageModule,
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
