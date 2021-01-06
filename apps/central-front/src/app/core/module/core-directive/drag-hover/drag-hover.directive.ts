import {Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2} from '@angular/core';
import {DropFileEvent} from './drop-file-event.class';
import {HelpService} from '../../../utils/help-service';


/**
 * Directive to add a class to the host element when a file or element is drag
 * over the host element and detect drop file event
 */
@Directive({
  selector: '[genDragHover]'
})
export class DragHoverDirective {

  /**
   * The class or classes to add to the host element when a file is hovering it
   */
  @Input() set genDragHover(genDragHover: string | string[]) {
    this.classes = HelpService.convertObjectOrArrayToArray(genDragHover);
  }

  /**
   * If true, it disable the directive
   */
  @Input() genDragHoverDisabled: boolean = false;

  /**
   * Input/Output data true if we are dragging over the host element
   */
  @Input() genDragIsHovering: boolean = false;

  /**
   * Input/Output data true if we are dragging over the host element
   */
  @Output() genDragIsHoveringChange: EventEmitter<boolean> = new EventEmitter();

  /**
   * Emit an event when a file is drop on the host
   */
  @Output() genDrop: EventEmitter<DropFileEvent> = new EventEmitter();

  // > 0 if the user is dragging over the host element
  private dragoverCount: number = 0;

  private classes: string[];

  /**
   * @ignore
   * Drag enter event
   */
  @HostListener('dragenter')
  dragEnter(): void {
    if (!this.genDragHoverDisabled) {
      this.onDragEnter();
    }
  }

  /**
   * @ignore
   * Drag leave event
   */
  @HostListener('dragleave')
  dragLeave(): void {
    if (!this.genDragHoverDisabled) {
      this.onDragLeave();
    }
  }

  /**
   * @ignore
   * Drop event
   */
  @HostListener('drop', ['$event'])
  drop(event: DragEvent): void {
    if (!this.genDragHoverDisabled) {

      // stop event to avoid file opening in browser
      this.stopEvent(event);

      // emit the drop event
      this.genDrop.emit({
        files: HelpService.convertFileListToArray(event.dataTransfer.files),
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
    if (!this.genDragHoverDisabled) {
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
    this.genDragIsHovering = this.dragoverCount > 0;
    this.genDragIsHoveringChange.emit(this.genDragIsHovering);
  }

  private stopEvent(event: Event): void {
    // block the event and do the add manually
    event.stopPropagation();
    event.preventDefault();
  }


}
