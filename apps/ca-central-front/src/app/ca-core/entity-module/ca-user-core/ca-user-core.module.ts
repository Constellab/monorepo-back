import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCustomMaterialModule} from '../../custom-material/ca-custom-material.module';
import {CaSelectUserOptionsComponent} from './component/ca-select-user-options/ca-select-user-options.component';
import {
  CaAuthenticatedUserInlineComponent
} from './component/ca-authenticated-user-inline/ca-authenticated-user-inline.component';
import {CaUserTableComponent} from './component/ca-user-table/ca-user-table.component';
import {CaCustomLibraryModule} from '../../custom-library/ca-custom-library.module';
import {CaUserListInlineComponent} from './component/ca-user-list-inline/ca-user-list-inline.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CaUserSearchComponent} from './component/ca-user-search/ca-user-search.component';
import {CaUserSearchFormComponent} from './component/ca-user-search-form/ca-user-search-form.component';

/**
 * Module containing users component
 */
@NgModule({
  declarations: [
    CaSelectUserOptionsComponent,
    CaAuthenticatedUserInlineComponent,
    CaUserTableComponent,
    CaUserListInlineComponent,
    CaUserSearchComponent,
    CaUserSearchFormComponent,
  ],
  exports: [
    CaSelectUserOptionsComponent,
    CaAuthenticatedUserInlineComponent,
    CaUserTableComponent,
    CaUserListInlineComponent,
    CaUserSearchComponent,
    CaUserSearchFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCustomMaterialModule,
    CaCustomLibraryModule,
    RouterModule,
  ]
})
export class CaUserCoreModule {
}
