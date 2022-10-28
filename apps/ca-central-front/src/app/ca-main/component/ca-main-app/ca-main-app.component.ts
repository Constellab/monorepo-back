import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CaMainMenuLink, caMainMenuLinks} from '../../model/ca-main-menu-link.class';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';
import {FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {
  CaNotificationsPortalComponent
} from '../../../ca-notifications/ca-notifications-portal/ca-notifications-portal.component';
import {CaMyOrganizationsPortalComponent} from '../ca-my-organizations-portal/ca-my-organizations-portal.component';
import {MatSidenav} from '@angular/material/sidenav';
import {Observable} from 'rxjs';
import {CaCurrentOrganizationService} from '../../../ca-core/service-api/ca-current-organization.service';
import {map} from 'rxjs/operators';

/**
 * Main app component. Menu on the left and page on the right
 */
@Component({
  selector: 'ca-main-app',
  templateUrl: './ca-main-app.component.html',
  styleUrls: ['./ca-main-app.component.scss']
})
export class CaMainAppComponent implements OnInit {

  @ViewChild(MatSidenav, {static: true, read: ElementRef}) sidenav: ElementRef<HTMLElement>;

  logo$: Observable<string>;

  accessibleLinks: CaMainMenuLink[];

  // set always side mode
  sidenavMode: 'over' | 'side' = 'side';


  constructor(private authenticatedUserService: CaAuthenticatedUserService,
              private currentOrganizationService: CaCurrentOrganizationService,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
    this.initAccessibleLinks();

    // if the current orga has a photo, use it, otherwise, use the default logo of gencovery
    this.logo$ = this.currentOrganizationService.getCurrentOrganizationPhoto$().pipe(
      map(photo => photo ?? 'assets/logo/logo.png')
    );
  }

  private initAccessibleLinks(): void {
    const accessibleLinks: CaMainMenuLink[] = [];
    for (const link of caMainMenuLinks) {
      // if the user doesn't have access to the link
      if (link.authorizedCategories && !this.authenticatedUserService.isCategory(...link.authorizedCategories)) {
        continue;
      }
      accessibleLinks.push(link);
    }

    this.accessibleLinks = accessibleLinks;
  }

  openMyOrganizationsPortal(): void {
    const config = this.portalService.configureRelativePortal(this.sidenav.nativeElement, [{
      originX: 'end',
      overlayX: 'start',
      originY: 'top',
      overlayY: 'top',
    }], {
      disposeOnOutsideClick: true,
      disposeOnNavigation: true,
      elevation: true
    });

    this.portalService.createPortal(CaMyOrganizationsPortalComponent, config);
  }
  openNotificationDiv(): void {
    const config: FlPortalConfig = this.portalService.configureAbsolutePortal({
      bottom: '4.5em',
      left: '5em'
    }, {
      disposeOnNavigation: true,
      disposeOnOutsideClick: true,
    });

    this.portalService.createPortal(CaNotificationsPortalComponent, config).detachments().subscribe()
  }

}
