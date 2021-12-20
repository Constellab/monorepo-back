import {Component, OnInit} from '@angular/core';
import {FlThemeService} from '@monorepo/front-core-lib';
import {ClTheme} from '@monorepo/core-lib';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';

/**
 * Component to select theme
 */
@Component({
  selector: 'ca-theme-selection',
  templateUrl: './ca-theme-selection.component.html',
  styleUrls: ['./ca-theme-selection.component.scss']
})
export class CaThemeSelectionComponent implements OnInit {

  private currentTheme: ClTheme;

  theme = ClTheme;

  constructor(private themeService: FlThemeService,
              private authenticatedUserService: CaAuthenticatedUserService) {
  }

  ngOnInit(): void {
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  selectTheme(theme: ClTheme): void {
    if (this.currentTheme !== theme) {
      this.themeService.changeTheme(theme);
      this.authenticatedUserService.changeTheme(theme).subscribe();
      this.currentTheme = theme;
    }
  }

}
