import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmarPagoPage } from './confirmar-pago.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [ConfirmarPagoPage],
  entryComponents: [ConfirmarPagoPage]
})
export class ConfirmarPagoPageModule {}
