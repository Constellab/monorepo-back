import {ClObject, ClSupportedLanguage} from '@monorepo/core-lib';

/**
 * When translating a mode can be provided
 * to change the case of the translated text
 */
export type FlTranslateMode = 'lowerCase' | 'upperCase' | 'capitalize';

/**
 * Object containing translation for a single language
 */
export type FlLangTranslation = ClObject;

/**
 * Optional params when translating a field
 */
export interface FlTranslateParam {

  /**
   * Params of the translation.
   * This is a key value object that will replace the parameters in the translation
   *
   * Parameters are marked between double brace in the translation like
   *
   * For example : '{{hello}}'
   */
  param?: FlLangTranslation;

  /**
   * When translating a mode can be provided
   * to change the case of the translated text
   */
  mode?: FlTranslateMode;
}

/**
 * Object that contain translation values for each supported lang
 */
export type FlTranslateObject = {
  [K in ClSupportedLanguage]: FlLangTranslation;
}

/**
 * Object for text to translate or not. If string, the text is not translated
 */
export type FlTranslatableText = string | {
  /**
   * Text to translate or not
   */
  text: string;
  /**
   * If true the text is translated
   */
  translateText?: boolean;

  /**
   * Param for the translation
   */
  translateParam?: FlTranslateParam;
}
