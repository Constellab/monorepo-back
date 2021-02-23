import {Component, OnInit} from '@angular/core';
import {FlThemeService} from '@monorepo/front-core-lib';
import {ClTheme} from '@monorepo/core-lib';
import {AuthenticatedUserService} from '../../../core/service-api/authenticated-user.service';

/**
 * Component to select theme
 */
@Component({
  selector: 'gen-theme-selection',
  templateUrl: './theme-selection.component.html',
  styleUrls: ['./theme-selection.component.scss']
})
export class ThemeSelectionComponent implements OnInit {

  private currentTheme: ClTheme;

  theme = ClTheme;

  constructor(private themeService: FlThemeService,
              private authenticatedUserService: AuthenticatedUserService) {
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
