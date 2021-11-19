import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlFormInputsManagerComponent} from './fl-form-inputs-manager/fl-form-inputs-manager.component';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';


@NgModule({
  declarations: [FlFormInputsManagerComponent],
  exports: [FlFormInputsManagerComponent],
  imports: [
    CommonModule,

    MatChipsModule,
    MatIconModule,

    FlTranslateModule,
  ]
})
export class FlFormInputsManagerModule {
}
