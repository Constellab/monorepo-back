import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCustomMaterialModule} from '../../custom-material/ca-custom-material.module';
import {CaCustomLibraryModule} from '../../custom-library/ca-custom-library.module';
import {CaAddCardComponent} from './ca-add-card/ca-add-card.component';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [
    CaAddCardComponent
  ],
  exports: [
    CaAddCardComponent
  ],
  imports: [
    CommonModule,

    CaCustomMaterialModule,
    CaCustomLibraryModule,
  ]
})
export class CaCoreComponentModule {
}
