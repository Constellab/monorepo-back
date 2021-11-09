import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';

/**
 * Simple directive to force the focus of the container when it appears on screen
 */
@Directive({
  selector: '[flAutofocus]'
})
export class FlAutofocusDirective implements AfterViewInit {

  /**
   * Delay in ms before the focus is executed
   */
  @Input() flAutofocus: number = 0;

  constructor(private elementRef: ElementRef<HTMLElement>) {
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.elementRef.nativeElement?.focus(), this.flAutofocus);
  }

}
