import {Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2} from '@angular/core';
import {FlDropFileEvent} from './fl-drop-file-event.class';
import {ClHelpService} from '@monorepo/core-lib';


/**
 * Directive to add a class to the host element when a file or element is drag
 * over the host element and detect drop file event
 */
@Directive({
  selector: '[flDragHover]'
})
export class FlDragHoverDirective {

  /**
   * The class or classes to add to the host element when a file is hovering it
   */
  @Input() set flDragHover(flDragHover: string | string[]) {
    this.classes = ClHelpService.convertObjectOrArrayToArray(flDragHover);
  }

  /**
   * If true, it disable the directive
   */
  @Input() flDragHoverDisabled: boolean = false;

  /**
   * Input/Output data true if we are dragging over the host element
   */
  @Input() flDragIsHovering: boolean = false;

  /**
   * Mode, when to activate the drop zone
   * File --> activate only in file drag
   * Element --> activate on everything but file
   * All activate on any drag
   */
  @Input() flDragHoverMode: 'file' | 'element' | 'all' = 'file';

  /**
   * Input/Output data true if we are dragging over the host element
   */
  @Output() flDragIsHoveringChange: EventEmitter<boolean> = new EventEmitter();

  /**
   * Emit an event when a file is drop on the host
   */
  @Output() flDrop: EventEmitter<FlDropFileEvent> = new EventEmitter();

  // > 0 if the user is dragging over the host element
  private dragoverCount: number = 0;

  private classes: string[];

  /**
   * @ignore
   * Drag enter event
   */
  @HostListener('dragenter', ['$event'])
  dragEnter(event: DragEvent): void {
    if (this.isDroppable(event)) {
      this.onDragEnter();
    }
  }

  /**
   * @ignore
   * Drag leave event
   */
  @HostListener('dragleave', ['$event'])
  dragLeave(event: DragEvent): void {
    if (this.isDroppable(event)) {
      this.onDragLeave();
    }
  }

  /**
   * @ignore
   * Drop event
   */
  @HostListener('drop', ['$event'])
  drop(event: DragEvent): void {
    if (this.isDroppable(event)) {

      // stop event to avoid file opening in browser
      this.stopEvent(event);

      // emit the drop event
      this.flDrop.emit({
        files: ClHelpService.convertFileListToArray(event.dataTransfer.files),
        event: event
      });

      this.clearClass();
    }
  }

  /**
   * @ignore
   * Drag over event to allow drop
   */
  @HostListener('dragover', ['$event'])
  dragOver(event: DragEvent): void {
    if (this.isDroppable(event)) {
      // stop event to allow drop
      this.stopEvent(event);
    }
  }

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {
    // init dragIsHovering value
    this.emitDragover();
  }

  private onDragEnter(): void {
    this.dragoverCount++;

    // if we enter in the zone
    if (this.dragoverCount === 1) {
      for (const c of this.classes) {
        this.renderer.addClass(this.elementRef.nativeElement, c);
      }
      this.emitDragover();
    }
  }

  private onDragLeave(): void {
    this.dragoverCount--;

    if (this.dragoverCount <= 0) {
      this.clearClass();
    }
  }

  private clearClass(): void {
    this.dragoverCount = 0;

    for (const c of this.classes) {
      this.renderer.removeClass(this.elementRef.nativeElement, c);
    }
    this.emitDragover();

  }

  // emit the data
  private emitDragover(): void {
    this.flDragIsHovering = this.dragoverCount > 0;
    this.flDragIsHoveringChange.emit(this.flDragIsHovering);
  }

  // return true if a file is dragged and the directive is not disable
  // this is to prevent activated class
  private isDroppable(event: DragEvent): boolean {
    return !this.flDragHoverDisabled && this.checkDataTransferType(event.dataTransfer);
  }

  private checkDataTransferType(dataTransfer: DataTransfer): boolean {
    if (dataTransfer == null) {
      return false;
    }

    switch (this.flDragHoverMode) {
      case 'file':
        return dataTransfer.types.includes('Files');
      case 'element':
        return !dataTransfer.types.includes('Files');
      case 'all':
        return true;
    }
  }

  private stopEvent(event: Event): void {
    // block the event and do the add manually
    event.stopPropagation();
    event.preventDefault();
  }


}
