import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InputMaxLengthDirective} from './input-max-length/input-max-length.directive';
import {QuillConfigDirective} from './quill-config/quill-config.directive';
import {DragHoverDirective} from './drag-hover/drag-hover.directive';
import {IconDirective} from './icon/icon.directive';
import {InfiniteScrollDirective} from './infinite-scroll/infinite-scroll.directive';


/**
 * Core modules containing directives
 */
@NgModule({
  declarations: [
    InputMaxLengthDirective,
    QuillConfigDirective,
    DragHoverDirective,
    IconDirective,
    InfiniteScrollDirective,
  ],
  exports: [
    InputMaxLengthDirective,
    QuillConfigDirective,
    DragHoverDirective,
    IconDirective,
    InfiniteScrollDirective,
  ],
  imports: [
    CommonModule
  ]
})
export class CoreDirectiveModule {
}
