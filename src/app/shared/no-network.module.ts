import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { NoNetworkComponent } from '../components/no-network/no-network.component';

@NgModule({
    imports: [
      CommonModule,
      IonicModule,
    ],
    declarations: [
      NoNetworkComponent,
    ],
    exports: [
      NoNetworkComponent,
    ]
  })

  export class NetworkModule {}
