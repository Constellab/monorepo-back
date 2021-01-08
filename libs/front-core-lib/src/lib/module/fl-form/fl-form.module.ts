import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlFormFieldComponent} from './component/fl-form-field/fl-form-field.component';


/**
 * Modules containing components for forms
 */
@NgModule({
  declarations: [
    FlFormFieldComponent
  ],
  exports: [
    FlFormFieldComponent
  ],
  imports: [
    CommonModule
  ]
})
export class FlFormModule {
}
