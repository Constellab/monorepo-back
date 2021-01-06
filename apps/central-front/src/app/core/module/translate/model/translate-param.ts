/**
 * When translating a mode can be provided
 * to change the case of the translated text
 */
export type LibTranslateMode = 'lowerCase' | 'upperCase' | 'capitalize';

/**
 * Optional params when translating a field
 */
export interface TranslateParam {

  /**
   * Params of the translation.
   * This is a key value object that will replace the parameters in the translation
   *
   * Parameters are marked between double brace in the translation like
   *
   * For example : '{{hello}}'
   */
  param?: Record<string, unknown>;

  /**
   * When translating a mode can be provided
   * to change the case of the translated text
   */
  mode?: LibTranslateMode;
}
