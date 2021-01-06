import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormFieldComponent} from './component/form-field/form-field.component';


/**
 * Modules containing components for forms
 */
@NgModule({
  declarations: [
    FormFieldComponent
  ],
  exports: [
    FormFieldComponent
  ],
  imports: [
    CommonModule
  ]
})
export class CoreFormModule {
}
