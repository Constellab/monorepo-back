import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DaPublicCoreModule } from './module/da-public-core/da-public-core.module';
import { DaPublicRoutingModule } from './da-public-routing.module';
import { CoreModule } from '@angular/flex-layout';
import {DaPublicDocPageModule} from './module/da-public-doc-page/da-public-doc-page.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DaPublicCoreModule,
    DaPublicRoutingModule,
    DaPublicDocPageModule,
    CoreModule
  ]
})
export class DaPublicModule { }
