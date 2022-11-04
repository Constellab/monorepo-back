import {Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {environment} from '../../../../../environments/ca-environment';
import {CaRouterService} from '../../../service/ca-router.service';
import {CaCurrentOrganizationService} from '../../../service-api/ca-current-organization.service';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Use to generate an external link to a another organization (useful for the admin pages)
 * In prod, it generates the url for the other domain
 * In dev, it updates the stored domain and refresh to the route
 */
@Directive({
  selector: 'a[caExternalOrganizationLink]'
})
export class CaExternalOrganizationLinkDirective implements OnInit {

  /**
   * Route to go to in the other organization
   */
  @Input() caExternalOrganizationLink: string;

  /**
   * Domain of the other organization
   */
  @Input() caExternalOrganizationDomain: string;

  @HostListener('click', ['$event']) onMouseEnter(event: MouseEvent): void {
    if (environment.production) return;

    this.currentOrganizationService.setCurrentOrganizationDomainDev(this.caExternalOrganizationDomain);
    ClHelpService.stopEventPropagation(event);
    // refresh the page to reload the current organization and move to route
    window.location.href = 'http://localhost:4200' + this.caExternalOrganizationLink;
  }

  constructor(private elementRef: ElementRef<HTMLLinkElement>,
              private currentOrganizationService: CaCurrentOrganizationService) {
  }

  ngOnInit(): void {
    if (environment.production) {
      // in prod generate the url for the other domain
      this.elementRef.nativeElement.href =
        CaRouterService.getOrganizationDomainUrl(this.caExternalOrganizationDomain, this.caExternalOrganizationLink);
    } else {
      // in dev no link, it is handled by the click event
      this.elementRef.nativeElement.href = null;
    }
  }


}
