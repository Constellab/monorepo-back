import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlDraggableDirective} from './fl-draggable/fl-draggable.directive';
import {FlDragHoverDirective} from './fl-drag-hover/fl-drag-hover.directive';


@NgModule({
  declarations: [
    FlDraggableDirective,
    FlDragHoverDirective,
  ],
  exports: [
    FlDraggableDirective,
    FlDragHoverDirective,
  ],
  imports: [
    CommonModule
  ]
})
export class FlDragModule { }
