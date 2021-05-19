import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlErrorRequiredPipe} from './fl-error-required/fl-error-required.pipe';
import {FlEnumToArrayPipe} from './fl-enum-to-array/fl-enum-to-array.pipe';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlDebugPipe} from './fl-debug/fl-debug.pipe';
import {FlYesNoPipe} from './fl-yes-no/fl-yes-no.pipe';

/**
 * Core module containing pipes
 */
@NgModule({
  declarations: [
    FlErrorRequiredPipe,
    FlEnumToArrayPipe,
    FlDebugPipe,
    FlYesNoPipe,
  ],
  exports: [
    FlErrorRequiredPipe,
    FlEnumToArrayPipe,
    FlDebugPipe,
    FlYesNoPipe,
  ],
  imports: [
    CommonModule,
    FlTranslateModule,
  ]
})
export class FlCorePipeModule {
}
