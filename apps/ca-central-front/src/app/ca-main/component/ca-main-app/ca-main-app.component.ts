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
import {CaNotificationState} from '../../../ca-core/state/ca-notification.state';

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

  menuExpanded: boolean = true;

  spaceLogo$: Observable<string>;
  spaceName$: Observable<string>;

  accessibleLinks: CaMainMenuLink[];

  numberOfNotifications$: Observable<string | number>;

  otherSpaceNotificationsNumber$: Observable<string | number>;

  constructor(private authenticatedUserService: CaAuthenticatedUserService,
              private currentSpaceService: CaCurrentSpaceService,
              private portalService: FlPortalService,
              private notificationState: CaNotificationState) {
  }

  ngOnInit(): void {
    this.initAccessibleLinks();

    // if the current space has a photo, use it, otherwise, use the default logo of gencovery
    this.spaceLogo$ = this.currentSpaceService.getCurrentSpacePhoto$().pipe(
      map(photo => photo ?? 'assets/logo/constellab-logo.svg')
    );
    this.spaceName$ = this.currentSpaceService.getCurrentSpace$().pipe(
      map(space => space?.name ?? null)
    );
    this.notificationState.init();

    this.numberOfNotifications$ = this.notificationState.getNotReadNotificationsNumber();
    this.otherSpaceNotificationsNumber$ = this.notificationState.getOtherSpacesNotificationsNumber();
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
