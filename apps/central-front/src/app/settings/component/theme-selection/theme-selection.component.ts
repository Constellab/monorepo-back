import {Component, OnInit} from '@angular/core';
import {FlThemeService} from '@monorepo/front-core-lib';
import {ClTheme} from '@monorepo/core-lib';

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

  constructor(private themeService: FlThemeService) {
  }

  ngOnInit(): void {
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  selectTheme(theme: ClTheme): void {
    if (this.currentTheme !== theme) {
      this.themeService.changeTheme(theme);
      this.currentTheme = theme;
    }
  }

}
