import {Directive, ElementRef, Input, NgZone, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Directive be able to resize the host element
 *
 * It adds an absolute element to the host to allow the resize
 *
 * It only support width resize
 */
@Directive({
  selector: '[flResize]'
})
export class FlResizeDirective implements OnInit, OnDestroy {

  /**
   * Mode of the resize, if the width or height can be resize, or both
   */
  @Input() flResize: 'width' | 'height' | 'both' = 'width';

  /**
   * Size of the resizer element in px
   */
  @Input() flResizeSize: number = 6;

  /**
   * Min size during resizing
   */
  @Input() flMinSize: number = 5;

  private mouseDownListeners: (() => void)[] = [];
  private mouseUpListener: () => void;
  private mouseMoveListener: () => void;

  // if the current resizing is width or height
  private currentResizeMode: 'width' | 'height';
  // pos of the the mouse on mouseDown event relative to current mode
  private baseEventPos: number;
  // size of the host on mouse down event  relative to current mode
  private baseHostSize: number;

  constructor(private renderer: Renderer2,
              private elementRef: ElementRef<HTMLElement>,
              private ngZone: NgZone) {
  }

  ngOnInit(): void {
    // set the parent to relative
    this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'relative');


    switch (this.flResize) {
      case 'width':
        this.createResizer('width');
        break;
      case 'height':
        this.createResizer('height');
        break;
      case 'both':
        this.createResizer('width');
        this.createResizer('height');
        break;
    }
  }

  /**
   * Create the resizer, add it to host and add listener
   * @param resizeMode
   * @private
   */
  private createResizer(resizeMode: 'width' | 'height'): void {

    // define div resizer
    const div: HTMLElement = this.getResizeElement(resizeMode);

    // add resizer to parent
    this.renderer.appendChild(this.elementRef.nativeElement, div);

    // run outside because there is not need to run inside angular scope
    this.ngZone.runOutsideAngular(() => {

      // listen to mouse down event on resizer
      this.mouseDownListeners.push(this.renderer.listen(div, 'mousedown',
        (event) => this.onMouseDown(event, resizeMode)));
    });
  }

  private getResizeElement(resizeMode: 'width' | 'height'): HTMLElement {
    const div: HTMLElement = this.renderer.createElement('div');
    this.renderer.setStyle(div, 'position', 'absolute');
    this.renderer.setStyle(div, 'user-select', 'none');
    this.renderer.setStyle(div, 'z-index', '999');

    // build div based on mode
    if (resizeMode === 'width') {
      this.renderer.setStyle(div, 'top', '0');
      // place it so the host border is in div center
      this.renderer.setStyle(div, 'right', `-${(this.flResizeSize / 2)}px`);
      this.renderer.setStyle(div, 'height', '100%');
      this.renderer.setStyle(div, 'width', this.flResizeSize + 'px');
      this.renderer.setStyle(div, 'cursor', 'col-resize');
    } else {
      this.renderer.setStyle(div, 'left', '0');
      // place it so the host border is in div center
      this.renderer.setStyle(div, 'bottom', `-${(this.flResizeSize / 2)}px`);
      this.renderer.setStyle(div, 'width', '100%');
      this.renderer.setStyle(div, 'height', this.flResizeSize + 'px');
      this.renderer.setStyle(div, 'cursor', 'row-resize');
    }

    return div;
  }


  private onMouseDown(event: MouseEvent, resizeMode: 'width' | 'height'): void {
    ClHelpService.stopEventPropagation(event);

    this.currentResizeMode = resizeMode;

    if (resizeMode === 'width') {
      this.baseEventPos = event.pageX;
      this.baseHostSize = this.elementRef.nativeElement.clientWidth;
    } else {
      this.baseEventPos = event.pageY;
      this.baseHostSize = this.elementRef.nativeElement.clientHeight;
    }

    // add a mouse move event to change the size of the parent
    this.mouseMoveListener = this.renderer.listen('window', 'mousemove',
      (event) => this.onMouseMove(event));

    // add mouse up listener
    this.mouseUpListener = this.renderer.listen('window', 'mouseup',
      () => this.onMouseUp());
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.currentResizeMode === 'width') {
      const newWidth: number = Math.max(this.baseHostSize + event.pageX - this.baseEventPos, this.flMinSize);

      // update the host with
      this.renderer.setStyle(this.elementRef.nativeElement, 'width', newWidth + 'px');
    } else {
      const newHeight: number = Math.max(this.baseHostSize + event.pageY - this.baseEventPos, this.flMinSize);

      // update the host height
      this.renderer.setStyle(this.elementRef.nativeElement, 'height', newHeight + 'px');
    }
  }

  private onMouseUp(): void {
    console.log('MouseUp');
    this.mouseMoveListener();
    this.mouseUpListener();
    this.baseEventPos = null;
    this.baseHostSize = null;
  }

  ngOnDestroy(): void {
    // clear all the mouse down event
    for (const mouseDownListener of this.mouseDownListeners) {
      mouseDownListener();
    }
    if (this.mouseUpListener) {
      this.mouseUpListener();
    }
    if (this.mouseMoveListener) {
      this.mouseMoveListener();
    }
  }


}
