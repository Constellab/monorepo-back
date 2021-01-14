import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomMaterialModule} from '../../custom-material/custom-material.module';
import {CustomLibraryModule} from '../../custom-library/custom-library.module';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [],
  exports: [],
  imports: [
    CommonModule,

    CustomMaterialModule,
    CustomLibraryModule,
  ]
})
export class CoreComponentModule {
}
