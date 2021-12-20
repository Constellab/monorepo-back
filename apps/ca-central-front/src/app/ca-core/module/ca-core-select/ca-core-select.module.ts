import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CaSelectUserCategoryOptionComponent
} from './ca-select-user-category-option/ca-select-user-category-option.component';
import {CaCustomMaterialModule} from '../../custom-material/ca-custom-material.module';
import {CaCustomLibraryModule} from '../../custom-library/ca-custom-library.module';

/**
 * Module for all generic select or select options component
 */
@NgModule({
  declarations: [
    CaSelectUserCategoryOptionComponent
  ],
  exports: [
    CaSelectUserCategoryOptionComponent
  ],
  imports: [
    CommonModule,
    CaCustomMaterialModule,
    CaCustomLibraryModule,
  ]
})
export class CaCoreSelectModule {
}
