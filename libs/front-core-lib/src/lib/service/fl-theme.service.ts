import {Inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {FlPlatformService} from './fl-plateform.service';
import {FlLocalStorageService} from './fl-local-storage.service';
import {DOCUMENT} from '@angular/common';
import {FlTheme} from '../model/fl-theme.class';

/**
 * Service to manage light and dark theme
 */
@Injectable({
  providedIn: 'root'
})
export class FlThemeService {

  private readonly themeKey: string = 'theme';

  private renderer: Renderer2;

  constructor(private platformService: FlPlatformService,
              private localStorageService: FlLocalStorageService,
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
  public getCurrentTheme(): FlTheme {
    let theme: FlTheme = this.localStorageService.getItem(this.themeKey) as FlTheme;

    if (!this.checkTheme(theme)) {
      theme = this.getBrowserTheme();
    }

    return theme;
  }

  /**
   * change the current app theme and save it in the local storage
   */
  public changeTheme(theme: FlTheme): void {
    if (this.checkTheme(theme)) {
      this.loadTheme(theme);

      this.storeTheme(theme);
    }
  }

  // change the app theme by changing the css file
  private loadTheme(theme: FlTheme): void {
    const link = (this.document.getElementById('app-theme') as HTMLLinkElement);

    if (link) {
      this.renderer.setAttribute(link, 'href', `${theme}.css`);
    }
  }

  private storeTheme(theme: FlTheme): void {
    this.localStorageService.setItem(this.themeKey, theme);
  }


  private checkTheme(theme: FlTheme | string): boolean {
    return theme === 'light-theme' || theme === 'dark-theme';
  }

  // get the theme of the browser
  public getBrowserTheme(): FlTheme {
    // dark-mode media query matched or not
    const matched: boolean = window?.matchMedia('(prefers-color-scheme: dark)')?.matches ?? true;

    return matched ? 'dark-theme' : 'light-theme';
  }
}
