import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlErrorRequiredPipe} from './fl-error-required/fl-error-required.pipe';
import {FlObjectKeysPipe} from './fl-object-keys/fl-object-keys.pipe';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlDebugPipe} from './fl-debug/fl-debug.pipe';
import {FlYesNoPipe} from './fl-yes-no/fl-yes-no.pipe';
import {FlBlobToSrcPipe} from './fl-blob-to-src/fl-blob-to-src.pipe';
import { FlCallMethodPipe } from './fl-call-method/fl-call-method.pipe';

/**
 * Core module containing pipes
 */
@NgModule({
  declarations: [
    FlErrorRequiredPipe,
    FlObjectKeysPipe,
    FlDebugPipe,
    FlYesNoPipe,
    FlBlobToSrcPipe,
    FlCallMethodPipe,
  ],
  exports: [
    FlErrorRequiredPipe,
    FlObjectKeysPipe,
    FlDebugPipe,
    FlYesNoPipe,
    FlBlobToSrcPipe,
    FlCallMethodPipe,
  ],
  imports: [
    CommonModule,
    FlTranslateModule,
  ]
})
export class FlCorePipeModule {
}
