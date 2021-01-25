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
  @HostListener('dragenter')
  dragEnter(): void {
    if (!this.flDragHoverDisabled) {
      this.onDraflter();
    }
  }

  /**
   * @ignore
   * Drag leave event
   */
  @HostListener('dragleave')
  dragLeave(): void {
    if (!this.flDragHoverDisabled) {
      this.onDragLeave();
    }
  }

  /**
   * @ignore
   * Drop event
   */
  @HostListener('drop', ['$event'])
  drop(event: DragEvent): void {
    if (!this.flDragHoverDisabled) {

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
    if (!this.flDragHoverDisabled) {
      // stop event to allow drop
      this.stopEvent(event);
    }
  }

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {
    // init dragIsHovering value
    this.emitDragover();
  }

  private onDraflter(): void {
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

  private stopEvent(event: Event): void {
    // block the event and do the add manually
    event.stopPropagation();
    event.preventDefault();
  }


}
