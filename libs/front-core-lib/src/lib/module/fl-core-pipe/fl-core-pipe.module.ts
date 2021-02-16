import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlErrorRequiredPipe} from './fl-error-required/fl-error-required.pipe';
import {FlDatePipe} from './fl-date/fl-date.pipe';
import {FlEnumToArrayPipe} from './fl-enum-to-array/fl-enum-to-array.pipe';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import { FlDebugPipe } from './fl-debug/fl-debug.pipe';

/**
 * Core module containing pipes
 */
@NgModule({
  declarations: [
    FlErrorRequiredPipe,
    FlDatePipe,
    FlEnumToArrayPipe,
    FlDebugPipe,
  ],
  exports: [
    FlErrorRequiredPipe,
    FlDatePipe,
    FlEnumToArrayPipe,
    FlDebugPipe,
  ],
  imports: [
    CommonModule,
    FlTranslateModule,
  ]
})
export class FlCorePipeModule {
}
