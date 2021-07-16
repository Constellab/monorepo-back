import {Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output} from '@angular/core';
import {FlMouseHoverChange} from './fl-mouse-hover-change.class';
import {ClOnChange} from '@monorepo/core-lib';
import {FlHtmlHelper} from '../../utils/fl-html.helper';

/**
 * Abstract directive to be extended to handle a MouseHover enter (with delay)
 * and MouseHover leave
 */
@Directive()
export abstract class FlMouseHoverAbstractDirective implements OnDestroy {
  /**
   * Event emitted on Hover status change (enter or leave)
   */
  @Output() flMouseHoverChange: EventEmitter<FlMouseHoverChange> = new EventEmitter();

  /**
   * Event emitted on mouse enter (including the delay)
   */
  @Output() flMouseEnter: EventEmitter<MouseEvent> = new EventEmitter();

  /**
   * Event emitted on mouse leave (including the delay)
   */
  @Output() flMouseLeave: EventEmitter<MouseEvent> = new EventEmitter();

  /**
   * Time (in millisecond) the user need to stay hovering the host element before triggering the enter event
   */
  @Input() flMouseEnterDelay: number = 0;

  /**
   * Time (in millisecond) the user need after the user left the element before triggering the leav event
   */
  @Input() flMouseLeaveDelay: number = 0;

  /**
   * If true the timer are cleared and the events not fired
   */
  @ClOnChange(function (this: FlMouseHoverAbstractDirective, value: boolean) {
    if (value) {
      this.clearTimer();
    }
  })
  @Input() disabled: boolean;

  /**
   * When provided the event are ignore if the mouse enter from the element or leave to the element
   * If a string it provided, it check the classes of the element
   */
  @Input() excludeElement: HTMLElement | string;

  /**
   * @ignore
   * local variable to know the status of the hover
   */
  protected isHovering: boolean = false;

  /**
   * @ignore
   * timer to handle the enter delay
   */
  protected timer: any;


  /**
   * @ignore
   * Method called on mouse enter event on host element
   */
  @HostListener('mouseenter', ['$event']) onMouseEnter(event: MouseEvent): void {
    if (this.disabled) return;

    this.clearTimer();

    if (this.isHovering) return;

    // if an excluded element is provided, ignore if the mouse enters from the ecxluded element
    const fromElement: HTMLElement = (event as any).fromElement;
    if (this.excludeElement && fromElement && FlHtmlHelper.isChildOf(fromElement, this.excludeElement)) {
      return;
    }


    // if the delay is 0, don't use timeout
    if (this.flMouseEnterDelay === 0) {
      this.triggerHoverEnter(event);
    } else {
      this.timer = setTimeout(() => this.triggerHoverEnter(event), this.flMouseEnterDelay);
    }

  }

  /**
   * @ignore
   * Method called on mouse leave event on host element
   */
  @HostListener('mouseleave', ['$event']) onMouseLeave(event: MouseEvent): void {
    if (this.disabled) return;

    this.clearTimer();

    if (!this.isHovering) return;

    // if an excluded element is provided, ignore if the mouse leaves to the excluded element
    const toElement: HTMLElement = (event as any).toElement;
    if (this.excludeElement && toElement && FlHtmlHelper.isChildOf(toElement, this.excludeElement)) {
      return;
    }


    // if the delay is 0, don't use timeout
    if (this.flMouseLeaveDelay === 0) {
      this.triggerHoverLeave(event);
    } else {
      this.timer = setTimeout(() => this.triggerHoverLeave(event), this.flMouseLeaveDelay);
    }
  }

  protected constructor(protected elementRef: ElementRef) {
  }

  /**
   * Method to override call when the hover entered (after delay)
   */
  abstract onTriggerHoverEnter(event: MouseEvent): void;

  /**
   * Method to override call when the hover leaves
   */
  abstract onTriggerHoverLeave(event: MouseEvent): void;

  // set the hovering as true
  protected triggerHoverEnter(event: MouseEvent): void {
    this.emitHoverEvent(true, event);
    this.isHovering = true;
    this.flMouseEnter.next(event);

    this.onTriggerHoverEnter(event);
  }

  // set the hovering as false
  protected triggerHoverLeave(event: MouseEvent): void {
    this.emitHoverEvent(false, event);
    this.isHovering = false;
    this.flMouseLeave.next(event);

    this.onTriggerHoverLeave(event);
  }

  private emitHoverEvent(isHovering: boolean, event: MouseEvent): void {
    this.flMouseHoverChange.emit({
      isHovering: isHovering,
      event: event
    });
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

}
