import {Component, OnInit} from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../model/main-menu-link.class';
import {AuthenticatedUserService} from '../../../core/service-api/authenticated-user.service';

/**
 * Main app component. Menu on the left and page on the right
 */
@Component({
  selector: 'gen-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss']
})
export class MainAppComponent implements OnInit {

  accessibleLinks: MainMenuLink[];

  // set always side mode
  sidenavMode: 'over' | 'side' = 'side';
  isOpen: boolean = true;


  constructor(private authenticatedUserService: AuthenticatedUserService) {
  }

  ngOnInit(): void {
    this.initAccessibleLinks();
  }

  private initAccessibleLinks(): void {
    const accessibleLinks: MainMenuLink[] = [];
    for (const link of mainMenuLinks) {
      // if the user doesn't have access to the link
      if (link.authorizedCategories && !this.authenticatedUserService.isCategory(...link.authorizedCategories)) {
        continue;
      }
      accessibleLinks.push(link);
    }

    this.accessibleLinks = accessibleLinks;
  }


}
