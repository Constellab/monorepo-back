import {AfterViewInit, Directive, ElementRef, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router, RoutesRecognized} from '@angular/router';
import {Observable, Subscription} from 'rxjs';

/**
 * Auto scroll to anchor in element
 */

@Directive({
  selector: '[flAutoScrollToAnchor]'
})
export class FlAutoScrollToAnchorDirective implements AfterViewInit, OnDestroy {

  subscriptions: Subscription[] = [];
  fragment: Observable<string>;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  ngAfterViewInit(): void {
    this.fragment = this.route.fragment;

    this.subscriptions.push(this.fragment.subscribe(anchor => {
      if (anchor) {
        this.scrollToAnchor(anchor)
      }
    }));


    this.subscriptions.push(this.router.events.subscribe(e => {
      if (e instanceof RoutesRecognized && e.url === e.urlAfterRedirects) {
        const anchor: string = e.url.split('#')[1];
        this.scrollToAnchor(anchor);
      }
    }));
  }

  private scrollToAnchor(anchor: string): void {
    const children: HTMLElement = this.elementRef.nativeElement.querySelector('#' + anchor);
    if (children) {
      children.scrollIntoView(true);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
