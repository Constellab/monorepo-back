import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DaPublicListBricksPageComponent} from './da-public-list-bricks-page/da-public-list-bricks-page.component';
import {DaCustomMaterialModule} from '../../../da-core/da-custom-material/da-custom-material.module';
import {DaCoreModule} from '../../../da-core/da-core.module';
import {CoreModule} from '@angular/flex-layout';
import {DaPublicCoreModule} from '../da-public-core/da-public-core.module';


@NgModule({
  declarations: [DaPublicListBricksPageComponent],
  imports: [
    DaCustomMaterialModule,
    CommonModule,
  ]
})
export class DaPublicListBricksPageModule {
}
