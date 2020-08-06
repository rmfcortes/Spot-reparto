import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CardClienteComponent } from '../components/card-cliente/card-cliente.component';
import { CardNegocioComponent } from '../components/card-negocio/card-negocio.component';

@NgModule({
    imports: [
      CommonModule,
      IonicModule,
    ],
    declarations: [
      CardClienteComponent,
      CardNegocioComponent,
    ],
    exports: [
      CardClienteComponent,
      CardNegocioComponent
    ]
  })

  export class ClienteCardModule {}
