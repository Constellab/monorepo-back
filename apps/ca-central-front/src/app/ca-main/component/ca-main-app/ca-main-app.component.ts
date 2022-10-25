import {Component, OnInit} from '@angular/core';
import {CaMainMenuLink, caMainMenuLinks} from '../../model/ca-main-menu-link.class';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';
import {FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {
  CaNotificationsPortalComponent
} from '../../../ca-notifications/ca-notifications-portal/ca-notifications-portal.component';

/**
 * Main app component. Menu on the left and page on the right
 */
@Component({
  selector: 'ca-main-app',
  templateUrl: './ca-main-app.component.html',
  styleUrls: ['./ca-main-app.component.scss']
})
export class CaMainAppComponent implements OnInit {

  accessibleLinks: CaMainMenuLink[];

  // set always side mode
  sidenavMode: 'over' | 'side' = 'side';
  isOpen: boolean = true;


  constructor(private authenticatedUserService: CaAuthenticatedUserService,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
    this.initAccessibleLinks();
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
