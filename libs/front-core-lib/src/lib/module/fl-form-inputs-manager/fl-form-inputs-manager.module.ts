import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlFormInputsManagerComponent} from './fl-form-inputs-manager/fl-form-inputs-manager.component';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatIconModule} from '@angular/material/icon';
import {FlCoreComponentModule} from '../fl-core-component/fl-core-component.module';
import {FlTextIconModule} from '../fl-text-icon/fl-text-icon.module';


@NgModule({
  declarations: [FlFormInputsManagerComponent],
  exports: [FlFormInputsManagerComponent],
  imports: [
    CommonModule,

    MatIconModule,

    FlTranslateModule,
    FlCoreComponentModule,
    FlTextIconModule,
  ]
})
export class FlFormInputsManagerModule {
}
