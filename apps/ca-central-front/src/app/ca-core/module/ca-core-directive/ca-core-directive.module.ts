import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaIsAdminDirective} from './ca-is-admin/ca-is-admin.directive';


@NgModule({
  declarations: [
    CaIsAdminDirective
  ],
  exports: [
    CaIsAdminDirective
  ],
  imports: [
    CommonModule
  ]
})
export class CaCoreDirectiveModule { }
