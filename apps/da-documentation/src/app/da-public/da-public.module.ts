import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DaPublicCoreModule } from './module/da-public-core/da-public-core.module';
import { DaPublicRoutingModule } from './da-public-routing.module';
import { CoreModule } from '@angular/flex-layout';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DaPublicCoreModule,
    DaPublicRoutingModule,
    CoreModule
  ]
})
export class DaPublicModule { }
