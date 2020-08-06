import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PermisosPageRoutingModule } from './permisos-routing.module';

import { PermisosPage } from './permisos.page';
import { NetworkModule } from 'src/app/shared/no-network.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NetworkModule,
    PermisosPageRoutingModule
  ],
  declarations: [PermisosPage]
})
export class PermisosPageModule {}
