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
import {CaUserInfoPortalComponent} from './component/ca-user-info-portal/ca-user-info-portal.component';
import {CaMouseHoverUserPortalDirective} from './directive/ca-mouse-hover-portal.directive';
import {CaUserListInlineComponent} from './component/ca-user-list-inline/ca-user-list-inline.component';
import {FormsModule} from '@angular/forms';
import {CaUserWithDateComponent} from './component/ca-user-with-date/ca-user-with-date.component';
import {RouterModule} from "@angular/router";

/**
 * Module containing users component
 */
@NgModule({
  declarations: [
    CaUserInlineComponent,
    CaSelectUserOptionsComponent,
    CaAuthenticatedUserInlineComponent,
    CaUserTableComponent,
    CaUserInfoPortalComponent,
    CaMouseHoverUserPortalDirective,
    CaUserListInlineComponent,
    CaUserWithDateComponent,
  ],
  exports: [
    CaUserInlineComponent,
    CaSelectUserOptionsComponent,
    CaAuthenticatedUserInlineComponent,
    CaUserTableComponent,
    CaUserListInlineComponent,
    CaUserWithDateComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,

    CaCustomMaterialModule,
    CaCustomLibraryModule,
    RouterModule,
  ]
})
export class CaUserCoreModule {
}
