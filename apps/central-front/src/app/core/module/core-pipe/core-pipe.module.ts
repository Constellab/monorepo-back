import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ErrorRequiredPipe} from './error-required/error-required.pipe';
import {CoreTranslateModule} from '../translate/core-translate.module';
import {CoreDatePipe} from './core-date/core-date.pipe';
import {EnumToArrayPipe} from './enum-to-array/enum-to-array.pipe';

/**
 * Core module containing pipes
 */
@NgModule({
  declarations: [
    ErrorRequiredPipe,
    CoreDatePipe,
    EnumToArrayPipe,
  ],
  exports: [
    ErrorRequiredPipe,
    CoreDatePipe,
    EnumToArrayPipe,
  ],
  imports: [
    CommonModule,
    CoreTranslateModule,
  ]
})
export class CorePipeModule {
}
