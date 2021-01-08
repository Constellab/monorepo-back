import {Injectable} from '@angular/core';
import {MissingTranslationHandler, MissingTranslationHandlerParams} from '@ngx-translate/core';

/**
 *
 * Simple service to log missing key for translation
 *
 * It needs to be provided in the forRoot method of the TranslateModule, see example
 *
 * @example
 *  TranslateModule.forRoot({missingTranslationHandler: {
 *     provide: MissingTranslationHandler,
 *      useExisting: LibMissingTranslationLogService
 * }})
 */
@Injectable()
export class FlMissingTranslationLogService extends MissingTranslationHandler {

  /**
   * Handle the missing translation and log it to the console
   * @param params the missing translation
   */
  handle(params: MissingTranslationHandlerParams): any {
    console.error(`Missing translation for key '${params.key}'`);
  }
}
