import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPage } from './chat.page';

import { BubblesComponent } from 'src/app/components/bubbles/bubbles.component';
import { NetworkModule } from 'src/app/shared/no-network.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetworkModule,
  ],
  declarations: [ChatPage, BubblesComponent],
  entryComponents:  [ChatPage]
})
export class ChatPageModule {}
