import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmarPagoPage } from './confirmar-pago.page';
import { NetworkModule } from 'src/app/shared/no-network.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetworkModule,
  ],
  declarations: [ConfirmarPagoPage],
  entryComponents: [ConfirmarPagoPage]
})
export class ConfirmarPagoPageModule {}
