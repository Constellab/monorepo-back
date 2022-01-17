import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HaPublicCoreModule } from './module/ha-public-core/ha-public-core.module';
import { HaPublicRoutingModule } from './ha-public-routing.module';
import { CoreModule } from '@angular/flex-layout';
import {HaPublicDocPageModule} from './module/ha-public-bricks/ha-public-brick-page/ha-public-doc-page/ha-public-doc-page.module';
import { HaPublicSidenavComponent } from './module/ha-public-bricks/ha-public-brick-page/ha-public-sidenav/ha-public-sidenav.component';
import {HaCoreModule} from '../ha-core/ha-core.module';
import {HaPublicBrickPageModule} from './module/ha-public-bricks/ha-public-brick-page/ha-public-brick-page.module';
import {HaPublicListBricksPageModule} from './module/ha-public-bricks/ha-public-list-bricks-page.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HaPublicCoreModule,
    HaPublicRoutingModule,
    HaPublicDocPageModule,
    HaPublicBrickPageModule,
    HaPublicListBricksPageModule,
    CoreModule,
    HaCoreModule,
  ]
})
export class HaPublicModule { }
