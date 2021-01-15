import {AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';

/**
 * Directive to be placed on a scrollable container and it emits an event when
 * the user has scroll and reach 'flTriggerDistance' pixel before the bottom of the container
 *
 * Useful to make infinite list where new element are loaded once the user has almost reach the
 * bottom of the container
 *
 * It supports mode for the directive container or the body scroll
 *
 */
@Directive({
  selector: '[flInfiniteScroll]'
})
export class FlInfiniteScrollDirective implements AfterViewInit {

  /**
   * Distance from bottom (in pixel) when the flTrigger is called
   *
   * If 100, the event (flInfiniteScroll) will be triggered when the user reach 100 px before the
   * bottom of the container
   */
  @Input() flInfiniteTriggerDistance: number = 100;

  /**
   * If true check to see if the trigger distance is reach
   * on directive init.
   *
   * If the event is emitted, the value emitted is null
   */
  @Input() flInfiniteCheckOnInit: boolean = false;

  /**
   * If disabled, no event will be emitted
   */
  @Input() flInfiniteDisabled: boolean = false;

  /**
   * Mode for the listen
   *
   * If container, it listens to the container scroll event and check the scroll on the container
   *
   * If body it listens to the windows scroll event and check the scroll on the body
   */
  @Input() flInfiniteMode: 'container' | 'body' = 'container';

  /**
   * Number of millisecond to wait after emitting an event.
   *
   * If set to 0, the debounce time is disabled
   */
  @Input() flInfiniteAfterDebounce: number = 500;

  /**
   * Output event which emit event when the user has scrolled at the
   * trigger distance form bottom
   *
   * The emitted value can be null
   */
  @Output() flInfiniteScroll: EventEmitter<Event> = new EventEmitter<Event>();

  // true when we are waiting flInfiniteAfterDebounce after an event
  private isWaiting: boolean = false;


  constructor(private elementRef: ElementRef<HTMLElement>) {
  }

  ngAfterViewInit(): void {
    if (this.flInfiniteCheckOnInit) {
      // use a time to avoid check problem
      setTimeout(() => this.checkDistance(null), 0);
    }
  }


  @HostListener('scroll', ['$event']) containerScroll(event: Event): void {
    if (this.flInfiniteMode === 'container') {
      this.checkDistance(event);
    }
  }

  @HostListener('window:scroll', ['$event']) windowScroll(event: Event): void {
    if (this.flInfiniteMode === 'body') {
      this.checkDistance(event);
    }
  }

  // method to check the trigger distance from bottom
  private checkDistance(event: Event): void {
    // check if the infinite scroll if disable
    if (this.flInfiniteDisabled || this.isWaiting) {
      return;
    }

    // distance from top within the scrollable container
    const distanceFromTop = this.getDistanceFromTop();

    // total height of the container with scroll
    const totalHeight = this.getTotalHeight();

    // limited height of the container
    const height = this.getHeight();

    const distanceFromBottom = totalHeight - (distanceFromTop + height);

    // check if the distance from bottom is lower than the defined limit
    if (distanceFromBottom <= this.flInfiniteTriggerDistance) {
      this.emitEvent(event);
    }
  }

  private emitEvent(event: Event): void {
    // emit trigger event
    this.flInfiniteScroll.emit(event);

    // wait X millisecond before being able to emit new event
    if (this.flInfiniteAfterDebounce > 0) {
      this.isWaiting = true;
      // reset the waiting to false after x milliseconds
      setTimeout(() => this.isWaiting = false, this.flInfiniteAfterDebounce);
    }
  }

  private getDistanceFromTop(): number {
    if (this.flInfiniteMode === 'container') {
      return this.elementRef.nativeElement.scrollTop;
    } else {
      return ((document.body.getBoundingClientRect() as any).y * -1) || 0;
    }
  }

  private getTotalHeight(): number {
    if (this.flInfiniteMode === 'container') {
      return this.elementRef.nativeElement.scrollHeight;
    } else {
      return document.body.scrollHeight || 0;
    }
  }

  private getHeight(): number {
    if (this.flInfiniteMode === 'container') {
      return this.elementRef.nativeElement.clientHeight;
    } else {
      return document.body.clientHeight || 0;
    }
  }
}
