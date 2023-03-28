import {Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {CaRouterService} from '../../../service/ca-router.service';
import {CaCurrentSpaceService} from '../../../service-api/ca-current-space.service';
import {ClHelpService} from '@monorepo/core-lib';
import {CaEnvironmentHelper} from '../../../utils/ca-environment.helper';

/**
 * Use to generate an external link to a another space (useful for the admin pages)
 * In prod, it generates the url for the other domain
 * In dev, it updates the stored domain and refresh to the route
 */
@Directive({
  selector: 'a[caExternalSpaceLink]'
})
export class CaExternalSpaceLinkDirective implements OnInit {

  /**
   * Route to go to in the other space
   */
  @Input() caExternalSpaceLink: string;

  /**
   * Domain of the other space
   */
  @Input() caExternalSpaceDomain: string;

  @HostListener('click', ['$event']) onMouseEnter(event: MouseEvent): void {
    if (CaEnvironmentHelper.isProduction()) return;

    this.currentSpaceService.setCurrentSpaceDomainDev(this.caExternalSpaceDomain);
    ClHelpService.stopEventPropagation(event);
    // refresh the page to reload the current space and move to route
    window.location.href = 'http://localhost:4200' + this.caExternalSpaceLink;
  }

  constructor(private elementRef: ElementRef<HTMLLinkElement>,
              private currentSpaceService: CaCurrentSpaceService) {
  }

  ngOnInit(): void {
    if (CaEnvironmentHelper.isProduction()) {
      // in prod generate the url for the other domain
      this.elementRef.nativeElement.href =
        CaRouterService.getSpaceDomainUrl(this.caExternalSpaceDomain, this.caExternalSpaceLink);
    } else {
      // in dev no link, it is handled by the click event
      this.elementRef.nativeElement.href = null;
    }
  }


}
