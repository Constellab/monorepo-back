import {Component, OnInit} from '@angular/core';
import {Theme} from '../../../core/model/global/theme.class';
import {ThemeService} from '../../../core/service/theme.service';

/**
 * Component to select theme
 */
@Component({
  selector: 'gen-theme-selection',
  templateUrl: './theme-selection.component.html',
  styleUrls: ['./theme-selection.component.scss']
})
export class ThemeSelectionComponent implements OnInit {

  private currentTheme: Theme;

  constructor(private themeService: ThemeService) {
  }

  ngOnInit(): void {
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  selectTheme(theme: Theme): void {
    if (this.currentTheme !== theme) {
      this.themeService.changeTheme(theme);
      this.currentTheme = theme;
    }
  }

}
