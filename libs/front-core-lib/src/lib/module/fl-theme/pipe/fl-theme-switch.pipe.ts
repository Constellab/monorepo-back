import {Pipe, PipeTransform} from '@angular/core';
import {FlThemeSwitch} from '../model/fl-theme-switch.class';
import {FlThemeService} from '../fl-theme.service';

/**
 * Pipe to switch between two values depending on the theme
 */
@Pipe({
  name: 'flThemeSwitch'
})
export class FlThemeSwitchPipe<T> implements PipeTransform {

  constructor(private themeService: FlThemeService) {
  }

  transform(themeSwitch: FlThemeSwitch<T>): T {
    if (themeSwitch == null) return null;

    return this.themeService.isDarkTheme() ? themeSwitch.darkTheme : themeSwitch.lightTheme;
  }

}
