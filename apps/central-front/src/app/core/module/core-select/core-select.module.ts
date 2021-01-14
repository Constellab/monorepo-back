import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SelectUserCategoryOptionComponent} from './select-user-category-option/select-user-category-option.component';
import {CustomMaterialModule} from '../../custom-material/custom-material.module';
import {CustomLibraryModule} from '../../custom-library/custom-library.module';

/**
 * Module for all generic select or select options component
 */
@NgModule({
  declarations: [
    SelectUserCategoryOptionComponent
  ],
  exports: [
    SelectUserCategoryOptionComponent
  ],
  imports: [
    CommonModule,
    CustomMaterialModule,
    CustomLibraryModule,
  ]
})
export class CoreSelectModule {
}
