import {AfterViewInit, Directive, ElementRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

/**
 * Auto scroll to anchor in element
 */

@Directive({
  selector: '[flAutoScrollToAnchor]'
})
export class FlAutoScrollToAnchorDirective implements AfterViewInit {

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private route: ActivatedRoute
  ) {
  }

  ngAfterViewInit(): void {
    this.route.fragment.subscribe(anchor => {
      if (anchor) {
        const children: HTMLElement = this.elementRef.nativeElement.querySelector('#' + anchor);
        if (children) {
          children.scrollIntoView(true);
        }
      }
    });
  }

}
