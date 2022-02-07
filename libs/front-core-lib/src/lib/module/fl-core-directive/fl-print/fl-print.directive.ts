import {Directive, ElementRef, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {DOCUMENT} from '@angular/common';

/**
 * Directive to place on element that must be focus by the print media query.
 *
 * When this is on an element, it will be the only element shown in the print mode
 */
@Directive({
  selector: '[flPrint]'
})
export class FlPrintDirective implements OnInit, OnDestroy{

  constructor(private renderer: Renderer2,
              @Inject(DOCUMENT) private document: Document,
              private element: ElementRef<HTMLElement>) {
  }

  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'g-activate-print');
    this.renderer.addClass(this.element.nativeElement, 'g-section-to-print')
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'g-activate-print');
  }



}
