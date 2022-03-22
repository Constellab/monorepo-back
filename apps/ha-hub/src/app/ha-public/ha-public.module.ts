import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HaPublicCoreModule} from './module/ha-public-core/ha-public-core.module';
import {HaPublicRoutingModule} from './ha-public-routing.module';
import {CoreModule} from '@angular/flex-layout';
import {HaCoreModule} from '../ha-core/ha-core.module';
import {HaPublicBrickPageModule} from './module/ha-public-bricks/ha-public-brick-page/ha-public-brick-page.module';
import {HaPublicListBricksPageModule} from './module/ha-public-bricks/ha-public-list-bricks-page.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HaPublicCoreModule,
    HaPublicRoutingModule,
    HaPublicBrickPageModule,
    HaPublicListBricksPageModule,
    CoreModule,
    HaCoreModule,
  ]
})
export class HaPublicModule {
}
