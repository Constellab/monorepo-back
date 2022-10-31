import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaIsAdminDirective} from './ca-is-admin/ca-is-admin.directive';
import {CaIsOrganizationAdminDirective} from './ca-is-organization-admlin/ca-is-organization-admin.directive';


@NgModule({
  declarations: [
    CaIsAdminDirective,
    CaIsOrganizationAdminDirective
  ],
  exports: [
    CaIsAdminDirective,
    CaIsOrganizationAdminDirective
  ],
  imports: [
    CommonModule
  ]
})
export class CaCoreDirectiveModule { }
