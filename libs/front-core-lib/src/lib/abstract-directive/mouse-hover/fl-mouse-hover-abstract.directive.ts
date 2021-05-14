import {Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output} from '@angular/core';
import {FlMouseHoverChange} from './fl-mouse-hover-change.class';

/**
 * Abstract directive to be extended to handle a MouseHover enter (with delay)
 * and MouseHover leave
 */
@Directive()
export abstract class FlMouseHoverAbstractDirective implements OnDestroy {
  /**
   * Event emitted on Hover status change (enter or leave)
   */
  @Output() flMouseHoverChange: EventEmitter<FlMouseHoverChange> = new EventEmitter<FlMouseHoverChange>();

  /**
   * Time (in millisecond) the user need to stay hovering the host element before triggering the enter event
   */
  @Input() flMouseHoverDelay: number = 0;


  /**
   * @ignore
   * local variable to know the status of the hover
   */
  protected isHovering: boolean = false;

  /**
   * @ignore
   * timer to handle the delay
   */
  protected timer: any;


  /**
   * @ignore
   * Method called on mouse enter event on host element
   */
  @HostListener('mouseenter', ['$event']) onMouseEnter(event: MouseEvent): void {
    this.clearTimer();

    if (this.isHovering) {
      return;
    }

    // if the delay is 0, don't use timeout
    if (this.flMouseHoverDelay === 0) {
      this.triggerHoverEnter(event);
    } else {
      this.timer = setTimeout(() => this.triggerHoverEnter(event), this.flMouseHoverDelay);
    }

  }

  /**
   * @ignore
   * Method called on mouse leave event on host element
   */
  @HostListener('mouseleave', ['$event']) onMouseLeave(event: MouseEvent): void {
    this.clearTimer();

    if (!this.isHovering) {
      return;
    }

    this.triggerHoverLeave(event);
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
    this.clearTimer();

    this.onTriggerHoverEnter(event);
  }

  // set the hovering as false
  protected triggerHoverLeave(event: MouseEvent): void {
    this.emitHoverEvent(false, event);
    this.isHovering = false;
    this.clearTimer();

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
