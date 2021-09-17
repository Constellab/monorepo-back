/**
 * Option for the translate method of the {@link TranslateService}
 */
export interface TranslateOptions {
  args?: ({ [k: string]: any; } | string)[] | { [k: string]: any; };
}
