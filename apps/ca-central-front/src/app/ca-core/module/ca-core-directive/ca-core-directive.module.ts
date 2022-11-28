import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaIsAdminDirective} from './ca-is-admin/ca-is-admin.directive';
import {CaIsSpaceAdminDirective} from './ca-is-space-admlin/ca-is-space-admin.directive';


@NgModule({
  declarations: [
    CaIsAdminDirective,
    CaIsSpaceAdminDirective
  ],
  exports: [
    CaIsAdminDirective,
    CaIsSpaceAdminDirective
  ],
  imports: [
    CommonModule
  ]
})
export class CaCoreDirectiveModule { }
