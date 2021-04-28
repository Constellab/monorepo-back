import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlInputMaxLengthDirective} from './fl-input-max-length/fl-input-max-length.directive';
import {FlQuillConfigDirective} from './fl-quill-config/fl-quill-config.directive';
import {FlDragHoverDirective} from './fl-drag-hover/fl-drag-hover.directive';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import { FlForByIdOfDirective } from './fl-for-by-id-of/fl-for-by-id-of.directive';
import {FlDrawerCloseDirective} from './fl-drawer-close/fl-drawer-close.directive';


/**
 * Core modules containing directives
 */
@NgModule({
  declarations: [
    FlInputMaxLengthDirective,
    FlQuillConfigDirective,
    FlDragHoverDirective,
    FlForByIdOfDirective,
    FlDrawerCloseDirective,
  ],
  exports: [
    FlInputMaxLengthDirective,
    FlQuillConfigDirective,
    FlDragHoverDirective,
    FlForByIdOfDirective,
    FlDrawerCloseDirective,
  ],
  imports: [
    CommonModule,

    FlPortalModule,
  ]
})
export class FlCoreDirectiveModule {
}
