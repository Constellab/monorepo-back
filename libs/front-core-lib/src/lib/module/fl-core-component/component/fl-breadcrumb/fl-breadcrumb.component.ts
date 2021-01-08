import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

interface Breadcrumb {
  name: string;
  url: string;
}

interface BreadcrumbPart {
  name: string;
  pos: number;
}

@Component({
  selector: 'fl-breadcrumb',
  templateUrl: './fl-breadcrumb.component.html',
  styleUrls: ['./fl-breadcrumb.component.scss']
})
export class FlBreadcrumbComponent implements OnInit, OnDestroy {

  /**
   * List of url part that are part of the breadcrumb menu.
   */
  @Input() availableParts: string[];

  // list of parts
  breadcrumbs: Breadcrumb[];

  subscription: Subscription;

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.subscription = this.router.events.pipe(
      filter(ev => ev instanceof NavigationEnd)
    ).subscribe(
      event => this.onRouterEvent((event as NavigationEnd).urlAfterRedirects)
    );

    this.onRouterEvent(this.router.url);
  }

  private onRouterEvent(url: string): void {
    // split the full url
    const routeParts: string[] = url.split('/');

    // get the different part with their position in the url
    const breadcrumbParts: BreadcrumbPart[] = this.getBreadcrumbParts(routeParts);

    const breadcrumbs: Breadcrumb[] = [];

    // for each part, retrieve the url
    // which is the full url until the next part
    for (let i = 0; i < breadcrumbParts.length; i++) {

      // get the next part position (or the end of the array)
      const nextPartPos: number = breadcrumbParts[i + 1]?.pos;
      breadcrumbs.push({
        name: breadcrumbParts[i].name,
        // get the url from the beginning until the next part
        url: routeParts.slice(0, nextPartPos).join('/')
      });
    }
    this.breadcrumbs = breadcrumbs;
  }

  // return all the breadcrumb part from the available part and the url
  private getBreadcrumbParts(routeParts: string[]): BreadcrumbPart[] {
    const breadcrumbParts: BreadcrumbPart[] = [];
    for (const step of this.availableParts) {
      const index: number = routeParts.findIndex((routePart) => routePart === step);

      if (index && index > -1) {
        breadcrumbParts.push({
          name: step,
          pos: index
        });
      }
    }

    // sort the parts by position in the url
    return breadcrumbParts.sort((a, b) => a.pos - b.pos);
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
