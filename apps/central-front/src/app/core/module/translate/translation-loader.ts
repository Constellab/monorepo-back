import {TranslateLoader} from '@ngx-translate/core';
import {Observable, zip} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

/**
 * @ignore
 *
 * Custom loader for the translation module
 *
 * This loader must be used to load the app translations because it also load lib translations
 *
 * The translation files must be under assets/i18n folder.
 * Those files' name must end with the language key such as 'fr' or 'en'...
 *
 * @example
 * // AoT requires an exported function for factories
 * // load the translations
 * export function HttpLoaderFactory(http: HttpClient) {
 *  return new TranslationLoader(http);
 * }
 *
 *
 * TranslateModule.forRoot({
 *     loader: {
 *       provide: TranslateLoader,
 *       useFactory: HttpLoaderFactory,
 *      deps: [HttpClient]
 *     },
 *   })
 */
export class TranslationLoader implements TranslateLoader {

  /**
   * Create the translation loader
   * @param http httpClient to load json files
   * @param filenames list of the filenames to loader (the language key is added directly after the filename)
   * @param prefix prefix for all files
   * @param suffix suffix for all file
   */
  constructor(private http: HttpClient,
              private filenames: string[] = [''],
              private prefix: string = 'assets/i18n/',
              private suffix: string = '.json') {
  }

  // load the app translation and add the library translation
  getTranslation(lang: string): Observable<any> {
    const obs$: Observable<any>[] = [];

    // create observable to get all translation
    for (const file of this.filenames) {
      obs$.push(this.http.get(`${this.prefix}${file}${lang}${this.suffix}`));
    }

    // wait for all request
    return zip(...obs$).pipe(
      map((translations: any[]) => this.getTranslationSuccess(translations))
    );
  }

  // add the translation from the library to the app translation
  private getTranslationSuccess(translations: any[]): any {
    const translation: any = {};

    // merge all translations
    for (const transl of translations) {
      Object.assign(translation, transl);
    }

    return translation;
  }
}
