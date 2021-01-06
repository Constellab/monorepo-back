import {Inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {CorePlatformService} from './core-plateform.service';
import {LocalStorageService} from './local-storage.service';
import {Theme} from '../model/global/theme.class';
import {DOCUMENT} from '@angular/common';

/**
 * Service to manage light and dark theme
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly themeKey: string = 'theme';

  private renderer: Renderer2;

  constructor(private platformService: CorePlatformService,
              private localStorageService: LocalStorageService,
              @Inject(DOCUMENT) private document: Document,
              rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public init(): void {
    this.loadTheme(this.getCurrentTheme());
  }

  /**
   * Return the current theme or the default
   */
  public getCurrentTheme(): Theme {
    let theme: Theme = this.localStorageService.getItem(this.themeKey) as Theme;

    if (!this.checkTheme(theme)) {
      theme = this.getBrowserTheme();
    }

    return theme;
  }

  /**
   * change the current app theme and save it in the local storage
   */
  public changeTheme(theme: Theme): void {
    if (this.checkTheme(theme)) {
      this.loadTheme(theme);

      this.storeTheme(theme);
    }
  }

  // change the app theme by changing the css file
  private loadTheme(theme: Theme): void {
    const link = (this.document.getElementById('app-theme') as HTMLLinkElement);

    if (link) {
      this.renderer.setAttribute(link, 'href', `${theme}.css`);
    }
  }

  private storeTheme(theme: Theme): void {
    this.localStorageService.setItem(this.themeKey, theme);
  }


  private checkTheme(theme: Theme | string): boolean {
    return theme === 'light-theme' || theme === 'dark-theme';
  }

  // get the theme of the browser
  public getBrowserTheme(): Theme {
    // dark-mode media query matched or not
    const matched: boolean = window?.matchMedia('(prefers-color-scheme: dark)')?.matches ?? true;

    return matched ? 'dark-theme' : 'light-theme';
  }
}
