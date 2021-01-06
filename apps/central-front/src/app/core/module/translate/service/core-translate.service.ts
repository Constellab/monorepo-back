import {Inject, Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {LibTranslateMode, TranslateParam} from '../model/translate-param';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CORE_TRANSLATE_MODULE_CONFIG, TranslateModuleConfig} from '../model/translate-module-config';
import {CookieService} from 'ngx-cookie-service';
import {CorePlatformService} from '../../../service/core-plateform.service';
import {StringHelper} from '../../../utils/string-helper';
import {DateHelper} from '../../../utils/date-helper';
import {DateAdapter} from '@angular/material/core';
import {Settings} from 'luxon';

@Injectable()
export class CoreTranslateService {

  private static instance: CoreTranslateService = null;

  // key to store the user language in the cookie
  private readonly cookieKey = 'lang';

  constructor(private translateService: TranslateService,
              private platformService: CorePlatformService,
              private cookieService: CookieService,
              @Inject(CORE_TRANSLATE_MODULE_CONFIG) private config: TranslateModuleConfig,
              private adapter: DateAdapter<any>) {
    // save this instance to static attribute
    CoreTranslateService.instance = this;
  }

  /**
   * @return the current instance of the translate service
   */
  public static getInstance(): CoreTranslateService {
    return CoreTranslateService.instance;
  }

  /**
   * @ignore
   * Init the default language and the used language
   *
   * Should not be call outside the library
   */
  public init(): void {
    const defaultLang = this.getDefaultLanguage();
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translateService.setDefaultLang(defaultLang);

    // set the app language
    const userLang = this.getUserLanguage();
    this.setAppLanguage(userLang);
  }


  /**
   * Returns the translation based on a key
   * @param key translation key
   * @param params optional params for the translation
   */
  public translate(key: string, params: TranslateParam = {}): string {
    const text = this.translateService.instant(key, params.param);

    return this.convertTranslatedTextCase(text, params.mode);
  }

  /**
   * Returns a stream of translated values of a key (or an array of keys) which updates
   * whenever the language changes.
   * @returns A stream of the translated key, or an object of translated keys
   */
  public stream(key: string | Array<string>, params: TranslateParam = {}): Observable<string> {
    return this.translateService.stream(key, params.param).pipe(
      map(text => this.convertTranslatedTextCase(text, params.mode))
    );
  }

  /**
   * Convert the case of the text based on the mode
   * @param text string to convert
   * @param mode mode
   */
  private convertTranslatedTextCase(text: string, mode: LibTranslateMode): string {
    if (text == null || mode == null) {
      return text;
    }

    switch (mode) {
      case 'lowerCase':
        return text.toLowerCase();
      case 'upperCase':
        return text.toUpperCase();
      case 'capitalize':
        return StringHelper.capitalize(text);
    }
    return text;
  }

  /**
   * Returns the user's browser preferred language within the available languages
   */
  public getUserLanguage(): string {
    // check for the platform because of the use of navigator
    if (this.platformService.isBrowserPlatform()) {

      // get the language from the cookie if it exists
      const cookieLang: string = this.getUserLanguageCookie();
      // if it exists, returns the lang from the cookie
      if (cookieLang) {
        return cookieLang;
      }

      if (navigator?.languages?.length) {
        // get the user languages
        const languages: ReadonlyArray<string> = navigator.languages;

        // check if the language is available
        for (const lang of languages) {
          // if the language is available
          if (this.config.availableLang.indexOf(lang) !== -1) {
            return lang;
          }
        }
      }
    } else {
      console.error('Not supported in SSR');
    }

    console.log('Language not supported. See the TranslateModuleConfig. ' +
      'Supported languages : ' + this.config.availableLang);
    return this.getDefaultLanguage();
  }

  /**
   * Sets the translated value of a key, after compiling it
   */
  public setTranslation(key: string, value: string, lang?: string): void {
    this.translateService.set(key, value, lang);
  }

  /**
   * Return the language store in the cookies
   */
  public getUserLanguageCookie(): string {
    return this.cookieService.get(this.cookieKey);
  }

  /**
   * Set the user language and store it in the cookies
   * @param lang the language of the user
   */
  public changeAppLanguage(lang: string): void {
    // set the language in the cookies
    this.cookieService.set(this.cookieKey, lang,
      this.getDateInTenYears(), '/', null, false
    );

    this.setAppLanguage(lang);
  }

  /**
   * Set the lang for the translate service, date and date adapter
   */
  private setAppLanguage(lang: string): void {
    // set the language in the translate service
    this.translateService.use(lang);

    // set the date local
    this.setDateLocale(lang);

    // set the material date adapter local (for date picker)
    this.adapter.setLocale(lang);
  }

  private getDateInTenYears(): Date {
    return new Date(new Date().getTime() + DateHelper.ONE_YEAR * 10);
  }

  // set the local for dates
  public setDateLocale(lang: string): void {
    Settings.defaultLocale = lang;
  }

  public getDefaultLanguage(): string {
    return this.config.defaultLang || 'en';
  }
}
