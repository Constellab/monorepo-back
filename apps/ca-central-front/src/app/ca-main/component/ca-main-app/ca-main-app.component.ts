import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CaMainMenuLink, caMainMenuLinks} from '../../model/ca-main-menu-link.class';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';
import {FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {
  CaNotificationsPortalComponent
} from '../../../ca-notifications/ca-notifications-portal/ca-notifications-portal.component';
import {CaMySpacesPortalComponent} from '../ca-my-spaces-portal/ca-my-spaces-portal.component';
import {MatSidenav} from '@angular/material/sidenav';
import {Observable} from 'rxjs';
import {CaCurrentSpaceService} from '../../../ca-core/service-api/ca-current-space.service';
import {map} from 'rxjs/operators';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';

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

  dashboardRoute = CaRouterService.getDashboardRoute();

  constructor(private authenticatedUserService: CaAuthenticatedUserService,
              private currentSpaceService: CaCurrentSpaceService,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
    this.initAccessibleLinks();

    // if the current space has a photo, use it, otherwise, use the default logo of gencovery
    this.logo$ = this.currentSpaceService.getCurrentSpacePhoto$().pipe(
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

  openMySpacesPortal(): void {
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

    this.portalService.createPortal(CaMySpacesPortalComponent, config);
  }

  openNotificationDiv(): void {
    const config: FlPortalConfig = this.portalService.configureAbsolutePortal({
      bottom: '4.5em',
      left: '5em'
    }, {
      disposeOnNavigation: true,
      disposeOnOutsideClick: true,
    });

    this.portalService.createPortal(CaNotificationsPortalComponent, config).detachments().subscribe();
  }

}
