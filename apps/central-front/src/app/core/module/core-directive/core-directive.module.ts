import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IsAdminDirective} from './is-admin/is-admin.directive';


@NgModule({
  declarations: [
    IsAdminDirective
  ],
  exports: [
    IsAdminDirective
  ],
  imports: [
    CommonModule
  ]
})
export class CoreDirectiveModule { }
