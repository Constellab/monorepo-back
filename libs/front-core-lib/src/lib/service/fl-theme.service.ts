import {Inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {FlPlatformService} from './fl-plateform.service';
import {FlLocalStorageService} from './fl-local-storage.service';
import {DOCUMENT} from '@angular/common';
import {clDefaultTheme, ClTheme, clThemeIsSupported} from '@monorepo/core-lib';
import {FlThemeDetail, flThemeDetailDark, flThemeDetailLight} from './model/fl-theme-detail.class';

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
  public getCurrentTheme(): ClTheme {
    let theme: ClTheme = this.localStorageService.getItem(this.themeKey) as ClTheme;

    if (!this.checkTheme(theme)) {
      theme = this.getBrowserTheme();
    }

    return theme;
  }

  /**
   * change the current app theme and save it in the local storage
   */
  public changeTheme(theme: ClTheme): void {
    if (this.checkTheme(theme) && theme !== this.getCurrentTheme()) {
      this.loadTheme(theme);

      this.storeTheme(theme);
    }
  }

  // change the app theme by changing the css file
  private loadTheme(theme: ClTheme): void {
    const link = (this.document.getElementById('app-theme') as HTMLLinkElement);

    if (link) {
      this.renderer.setAttribute(link, 'href', `${theme}.css`);
    }
  }

  private storeTheme(theme: ClTheme): void {
    this.localStorageService.setItem(this.themeKey, theme);
  }


  private checkTheme(theme: ClTheme | string): boolean {
    return clThemeIsSupported(theme);
  }

  // get the theme of the browser
  public getBrowserTheme(): ClTheme {
    // dark-mode media query matched or not
    const matched: boolean = window?.matchMedia('(prefers-color-scheme: dark)')?.matches;

    if(matched == null){
      return clDefaultTheme;
    }
    return matched ? ClTheme.DARK_THEME : ClTheme.LIGHT_THEME;
  }


  /**
   * Return the current theme detail
   */
  public getCurrentThemeDetail(): FlThemeDetail {
    const theme: ClTheme = this.getCurrentTheme();

    return theme === ClTheme.LIGHT_THEME ? flThemeDetailLight : flThemeDetailDark;
  }
}
