import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlInputMaxLengthDirective} from './fl-input-max-length/fl-input-max-length.directive';
import {FlDragHoverDirective} from './fl-drag-hover/fl-drag-hover.directive';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {FlForByIdOfDirective} from './fl-for-by-id-of/fl-for-by-id-of.directive';
import {FlDrawerCloseDirective} from './fl-drawer-close/fl-drawer-close.directive';
import {FlMouseHoverDirective} from './fl-mouse-hover/fl-mouse-hover.directive';
import {FlResizeDirective} from './fl-resize/fl-resize.directive';
import {FlOutsideClickDirective} from './fl-outside-click/fl-outside-click.directive';
import {FlDisableAnimationInitDirective} from './fl-disable-animation-init/fl-disable-animation-init.directive';
import {FlAutofocusDirective} from './fl-autofocus/fl-autofocus.directive';


/**
 * Core modules containing directives
 */
@NgModule({
  declarations: [
    FlInputMaxLengthDirective,
    FlDragHoverDirective,
    FlForByIdOfDirective,
    FlDrawerCloseDirective,
    FlMouseHoverDirective,
    FlResizeDirective,
    FlOutsideClickDirective,
    FlDisableAnimationInitDirective,
    FlAutofocusDirective,
  ],
  exports: [
    FlInputMaxLengthDirective,
    FlDragHoverDirective,
    FlForByIdOfDirective,
    FlDrawerCloseDirective,
    FlMouseHoverDirective,
    FlResizeDirective,
    FlOutsideClickDirective,
    FlDisableAnimationInitDirective,
    FlAutofocusDirective,
  ],
  imports: [
    CommonModule,

    FlPortalModule,
  ]
})
export class FlCoreDirectiveModule {
}
