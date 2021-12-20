import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCustomMaterialModule} from '../../custom-material/ca-custom-material.module';
import {CaCustomLibraryModule} from '../../custom-library/ca-custom-library.module';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [],
  exports: [],
  imports: [
    CommonModule,

    CaCustomMaterialModule,
    CaCustomLibraryModule,
  ]
})
export class CaCoreComponentModule {
}
