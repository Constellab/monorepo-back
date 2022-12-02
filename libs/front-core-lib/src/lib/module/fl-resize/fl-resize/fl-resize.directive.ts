import {Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import {ClHelpService} from '@monorepo/core-lib';
import {FlCoord} from '../../../model/shared/fl-coord.class';
import {Observable, of, Subscription} from 'rxjs';

export type FlResizeMode = 'width' | 'height' | 'both' | 'bothKeepRatio';

export interface FlResizeEvent {
  mode: FlResizeMode;
  width: number; // new width of the element
  height: number; // new height of the element
  fullscreen: boolean;
}

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
   * Observable on the disabled value of the text-editor
   */
  @Input() disabled$: Observable<boolean> = of(false);

  /**
   * Size of the resizer element in px
   */
  @Input() flResizeSize: number = 6;

  @Output() flResizeChanged: EventEmitter<FlResizeEvent> = new EventEmitter();

  private mouseDownListeners: (() => void)[] = [];
  private mouseUpListener: () => void;
  private mouseMoveListener: () => void;

  // if the current resizing is width or height
  private currentResizeMode: FlResizeMode;
  // pos of the mouse on mouseDown event relative to current mode
  private baseEventPos: FlCoord;
  // size of the host on mouse down event  relative to current mode
  private baseHostSize: FlCoord;

  private resizerDivs: HTMLElement[] = [];

  private subscription: Subscription;


  constructor(private renderer: Renderer2,
              private elementRef: ElementRef<HTMLElement>,
              private ngZone: NgZone) {
  }

  ngOnInit(): void {
    // set the parent to relative
    this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'relative');

    if (this.disabled$) {
      this.subscription = this.disabled$.subscribe(disable => this.onDisableChange(disable));
    }
  }

  /**
   * Delete currents resizers if it's disable or create new ones
   * @param disable
   * @private
   */
  private onDisableChange(disable: boolean): void {
    if (disable) {
      if (!this.resizerDivs || this.resizerDivs.length == 0) return;
      for (const rDiv of this.resizerDivs) {
        this.renderer.removeChild(this.elementRef.nativeElement, rDiv);
      }
      this.resizerDivs = [];
    } else {
      // create the resizer
      this.createResizer(this.flResize);

      // when both mode, also activate width and height resizer
      if (this.flResize === 'both' || this.flResize === 'bothKeepRatio') {
        this.createResizer('width');
        this.createResizer('height');
      }
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

    this.resizerDivs.push(div);
  }

  // generate the resize HTML element
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
      case 'bothKeepRatio':
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


  /**
   * Event called on a resize element mouse down. This save the resize mode, mouse pos and element size
   * It create a mouse move event to track mouse moves
   * @param event
   * @param resizeMode
   * @private
   */
  private onMouseDown(event: MouseEvent, resizeMode: FlResizeMode): void {
    ClHelpService.stopEventPropagation(event);

    this.currentResizeMode = resizeMode;

    this.baseEventPos = {
      x: event.pageX,
      y: event.pageY
    };

    this.baseHostSize = {
      x: this.hostWidth,
      y: this.hostHeight
    };

    // add a mouse move event to change the size of the parent
    this.mouseMoveListener = this.renderer.listen('window', 'mousemove',
      (event) => this.onMouseMove(event));

    // add mouse up listener
    this.mouseUpListener = this.renderer.listen('window', 'mouseup',
      () => this.onMouseUp());
  }

  private onMouseMove(event: MouseEvent): void {
    const newHeight: number = this.baseHostSize.y + event.pageY - this.baseEventPos.y;

    let newWidth: number;

    if (this.currentResizeMode === 'bothKeepRatio') {
      // get ratio of the image
      const ratio = this.baseHostSize.x / this.baseHostSize.y;

      // calculate width automatically bases on height and ratio
      newWidth = newHeight * ratio;

    } else {
      // calculate width base on mouse position
      newWidth = this.baseHostSize.x + event.pageX - this.baseEventPos.x;
    }

    this.updateSize(newWidth, newHeight, this.currentResizeMode);
  }

  public updateSize(width: number, height: number, mode: FlResizeMode): void {
    switch (mode) {
      case 'width':
        this.setWidth(width);
        break;
      case 'height':
        this.setHeight(height);
        break;
      case 'both':
      case 'bothKeepRatio':
        this.setWidth(width);
        this.setHeight(height);
        break;
    }

    // trigger change event
    this.emitChangeEvent({
      mode: this.currentResizeMode,
      width: this.hostWidth,
      height: this.hostHeight,
      fullscreen: false
    });
  }

  private setWidth(width: number): void {
    // update the host width
    this.renderer.setStyle(this.elementRef.nativeElement, 'width', width + 'px');
  }

  private setHeight(height: number): void {
    // update the host height
    this.renderer.setStyle(this.elementRef.nativeElement, 'height', height + 'px');
  }

  private onMouseUp(): void {
    this.mouseMoveListener();
    this.mouseUpListener();
    this.baseEventPos = null;
    this.baseHostSize = null;
  }

  public get hostWidth(): number {
    return this.elementRef.nativeElement.clientWidth;
  }

  public get hostHeight(): number {
    return this.elementRef.nativeElement.clientHeight;
  }

  /**
   * Method called by the
   */
  public setFullscreen(): void {
    if (!window) return;
    this.setWidth(window.innerWidth);
    this.setHeight(window.innerHeight);

    // trigger change event FlResizeFullscreenButtonComponent to set full screen
    this.emitChangeEvent({
      mode: this.currentResizeMode,
      width: this.hostWidth,
      height: this.hostHeight,
      fullscreen: true
    });
  }

  private emitChangeEvent(ev: FlResizeEvent): void {
    // trigger change event
    this.flResizeChanged.next(ev);
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

    this.subscription?.unsubscribe();
  }


}
