import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaUserInlineComponent} from './component/ca-user-inline/ca-user-inline.component';
import {CaCustomMaterialModule} from '../../custom-material/ca-custom-material.module';
import {CaSelectUserOptionsComponent} from './component/ca-select-user-options/ca-select-user-options.component';
import {
  CaAuthenticatedUserInlineComponent
} from './component/ca-authenticated-user-inline/ca-authenticated-user-inline.component';
import {CaUserTableComponent} from './component/ca-user-table/ca-user-table.component';
import {CaCustomLibraryModule} from '../../custom-library/ca-custom-library.module';
import {CaUserListInlineComponent} from './component/ca-user-list-inline/ca-user-list-inline.component';

/**
 * Module containing users component
 */
@NgModule({
  declarations: [
    CaUserInlineComponent,
    CaSelectUserOptionsComponent,
    CaAuthenticatedUserInlineComponent,
    CaUserTableComponent,
    CaUserListInlineComponent,
  ],
  exports: [
    CaUserInlineComponent,
    CaSelectUserOptionsComponent,
    CaAuthenticatedUserInlineComponent,
    CaUserTableComponent,
    CaUserListInlineComponent,
  ],
  imports: [
    CommonModule,

    CaCustomMaterialModule,
    CaCustomLibraryModule,
  ]
})
export class CaUserCoreModule {
}
