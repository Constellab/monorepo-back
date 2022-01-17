import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HaPublicListBricksPageComponent} from './ha-public-list-bricks-page/ha-public-list-bricks-page.component';
import {HaCustomMaterialModule} from '../../../ha-core/ha-custom-material/ha-custom-material.module';
import {HaCoreModule} from '../../../ha-core/ha-core.module';
import {CoreModule} from '@angular/flex-layout';
import {HaPublicCoreModule} from '../ha-public-core/ha-public-core.module';


@NgModule({
  declarations: [HaPublicListBricksPageComponent],
  imports: [
    HaCustomMaterialModule,
    CommonModule,
  ]
})
export class HaPublicListBricksPageModule {
}
