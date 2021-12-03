import {Directive, ElementRef, Input, NgZone, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ClHelpService} from '@monorepo/core-lib';
import {FlCoord} from '../../../model/shared/fl-coord.class';

type FlResizeMode = 'width' | 'height' | 'both'

/**
 * Directive be able to resize the host element
 *
 * It adds an absolute element to the host to allow the resize
 *
 * It only supports width resize
 */
@Directive({
  selector: '[flResize]'
})
export class FlResizeDirective implements OnInit, OnDestroy {

  /**
   * Mode of the resize, if the width or height can be resized, or both
   */
  @Input() flResize: FlResizeMode = 'width';

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
  private currentResizeMode: FlResizeMode;
  // pos of the mouse on mouseDown event relative to current mode
  private baseEventPos: FlCoord;
  // size of the host on mouse down event  relative to current mode
  private baseHostSize: FlCoord;

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
        this.createResizer('both');
        break;
    }
  }

  /**
   * Create the resizer, add it to host and add listener
   * @param resizeMode
   * @private
   */
  private createResizer(resizeMode: FlResizeMode): void {

    // define div resizer
    const div: HTMLElement = this.getResizeElement(resizeMode);

    // add resizer to parent
    this.renderer.appendChild(this.elementRef.nativeElement, div);

    // run outside because there is no need to run inside angular scope
    this.ngZone.runOutsideAngular(() => {

      // listen to mouse down event on resizer
      this.mouseDownListeners.push(this.renderer.listen(div, 'mousedown',
        (event) => this.onMouseDown(event, resizeMode)));
    });
  }

  private getResizeElement(resizeMode: FlResizeMode): HTMLElement {
    const div: HTMLElement = this.renderer.createElement('div');
    this.renderer.setStyle(div, 'position', 'absolute');
    this.renderer.setStyle(div, 'user-select', 'none');
    this.renderer.setStyle(div, 'z-index', '999');

    // build div based on mode
    switch (resizeMode) {
      case 'width':
        this.renderer.setStyle(div, 'top', '0');
        // place it so the host border is in div center
        this.renderer.setStyle(div, 'right', `-${(this.flResizeSize / 2)}px`);
        this.renderer.setStyle(div, 'height', '100%');
        this.renderer.setStyle(div, 'width', this.flResizeSize + 'px');
        this.renderer.setStyle(div, 'cursor', 'w-resize');
        break;
      case 'height':
        this.renderer.setStyle(div, 'left', '0');
        // place it so the host border is in div center
        this.renderer.setStyle(div, 'bottom', `-${(this.flResizeSize / 2)}px`);
        this.renderer.setStyle(div, 'width', '100%');
        this.renderer.setStyle(div, 'height', this.flResizeSize + 'px');
        this.renderer.setStyle(div, 'cursor', 'n-resize');
        break;
      case 'both':
        this.renderer.setStyle(div, 'right', `-${(this.flResizeSize / 2)}px`);
        this.renderer.setStyle(div, 'bottom', `-${(this.flResizeSize / 2)}px`);
        // place it so the host border is in div center
        this.renderer.setStyle(div, 'width', this.flResizeSize + 'px');
        this.renderer.setStyle(div, 'height', this.flResizeSize + 'px');
        this.renderer.setStyle(div, 'cursor', 'nw-resize');
        break;
    }

    return div;
  }


  private onMouseDown(event: MouseEvent, resizeMode: FlResizeMode): void {
    ClHelpService.stopEventPropagation(event);

    this.currentResizeMode = resizeMode;

    this.baseEventPos = {
      x: event.pageX,
      y: event.pageY
    };

    this.baseHostSize = {
      x: this.elementRef.nativeElement.clientWidth,
      y: this.elementRef.nativeElement.clientHeight
    };

    // add a mouse move event to change the size of the parent
    this.mouseMoveListener = this.renderer.listen('window', 'mousemove',
      (event) => this.onMouseMove(event));

    // add mouse up listener
    this.mouseUpListener = this.renderer.listen('window', 'mouseup',
      () => this.onMouseUp());
  }

  private onMouseMove(event: MouseEvent): void {

    switch (this.currentResizeMode) {
      case 'width':
        this.changeWidth(event.pageX);
        break;
      case 'height':
        this.changeHeight(event.pageY);
        break;
      case 'both':
        this.changeWidth(event.pageX);
        this.changeHeight(event.pageY);
        break;
    }

  }

  private changeWidth(x: number): void {
    const newWidth: number = Math.max(this.baseHostSize.x + x - this.baseEventPos.x, this.flMinSize);

    // update the host with
    this.renderer.setStyle(this.elementRef.nativeElement, 'width', newWidth + 'px');
  }

  private changeHeight(y: number): void {
    const newHeight: number = Math.max(this.baseHostSize.y + y - this.baseEventPos.y, this.flMinSize);

    // update the host height
    this.renderer.setStyle(this.elementRef.nativeElement, 'height', newHeight + 'px');
  }

  private onMouseUp(): void {
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
