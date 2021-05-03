import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlInputMaxLengthDirective} from './fl-input-max-length/fl-input-max-length.directive';
import {FlQuillConfigDirective} from './fl-quill-config/fl-quill-config.directive';
import {FlDragHoverDirective} from './fl-drag-hover/fl-drag-hover.directive';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import { FlForByIdOfDirective } from './fl-for-by-id-of/fl-for-by-id-of.directive';
import {FlDrawerCloseDirective} from './fl-drawer-close/fl-drawer-close.directive';
import {FlMouseHoverDirective} from './fl-mouse-hover/fl-mouse-hover.directive';
import { FlQuillSanitizerDirective } from './fl-quill-sanitizer/fl-quill-sanitizer.directive';


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
    FlMouseHoverDirective,
    FlQuillSanitizerDirective,
  ],
  exports: [
    FlInputMaxLengthDirective,
    FlQuillConfigDirective,
    FlDragHoverDirective,
    FlForByIdOfDirective,
    FlDrawerCloseDirective,
    FlMouseHoverDirective,
    FlQuillSanitizerDirective,
  ],
  imports: [
    CommonModule,

    FlPortalModule,
  ]
})
export class FlCoreDirectiveModule {
}
