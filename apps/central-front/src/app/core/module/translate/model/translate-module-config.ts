import {InjectionToken} from '@angular/core';

/**
 * Configuration for the Translate Module
 */
export interface TranslateModuleConfig {
  /**
   * If not filled --> EN
   */
  defaultLang?: string;

  /**
   * List the available language on the application
   *
   * Languages must be short names like 'fr', 'en'...
   */
  availableLang: string[];

  /**
   * list of the filenames to load (the language key is added directly after the filename)
   *
   * Default to ''
   */
  filenames?: string[];

  /**
   * Prefix for all translation files
   *
   * Default to 'assets/i18n/'
   */
  filePrefix?: string;

  /**
   * Suffix for all translation file
   *
   * Default to '.json'
   */
  fileSuffix?: string;
}

/**
 * @ignore
 * Use to inject the configuration of the translate module
 *
 * Use '@Inject(CORE_TRANSLATE_MODULE_CONFIG)' to inject it in component or service
 */
export const CORE_TRANSLATE_MODULE_CONFIG =
  new InjectionToken<TranslateModuleConfig>('CORE_TRANSLATE_MODULE_CONFIG');
