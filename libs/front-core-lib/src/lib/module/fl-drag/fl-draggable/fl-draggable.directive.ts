import {Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2} from '@angular/core';
import {FlDragManagerService} from '../fl-drag-manager.service';

@Directive({
  selector: '[flDraggable]'
})
export class FlDraggableDirective implements OnInit {

  /**
   * Type of the data to drag. Useful to distinguish different drag object
   * to activate drop or not based on type
   */
  @Input() flDraggableType: string;

  /**
   * Data to pass to drag event (must support stringify)
   */
  @Input() flDraggableData: any;

  /**
   * Element to use as ghost when dragging
   */
  @Input() flDraggableGhostElement: HTMLElement;

  @Output() flDragStart: EventEmitter<DragEvent> = new EventEmitter();

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    this.dragManager.setDraggedData(this.flDraggableType, this.flDraggableData);

    this.flDragStart.emit(event);

    if (this.flDraggableGhostElement) {
      event.dataTransfer.setDragImage(this.flDraggableGhostElement, 0, 0);
    }
  }


  constructor(private elementRef: ElementRef,
              private renderer: Renderer2,
              private dragManager: FlDragManagerService) {
  }

  ngOnInit(): void {
    this.renderer.setAttribute(this.elementRef.nativeElement, 'draggable', 'true');

    if (!this.flDraggableType) {
      console.error('[flDraggable] flDraggableKey is required');
    }
  }


}
