import {Component, OnInit} from '@angular/core';
import {FlTheme, FlThemeService} from '@monorepo/front-core-lib';

/**
 * Component to select theme
 */
@Component({
  selector: 'gen-theme-selection',
  templateUrl: './theme-selection.component.html',
  styleUrls: ['./theme-selection.component.scss']
})
export class ThemeSelectionComponent implements OnInit {

  private currentTheme: FlTheme;

  constructor(private themeService: FlThemeService) {
  }

  ngOnInit(): void {
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  selectTheme(theme: FlTheme): void {
    if (this.currentTheme !== theme) {
      this.themeService.changeTheme(theme);
      this.currentTheme = theme;
    }
  }

}
