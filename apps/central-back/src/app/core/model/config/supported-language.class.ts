/**
 * List of languages supported by the application
 */
export enum SupportedLanguage {
  en = 'en'
}

export const defaultLang: SupportedLanguage = SupportedLanguage.en;

/**
 * Name of the cookie that contains the lang
 */
export const langCookie: string = 'lang';

/**
 * Return true if the string lang is a supported lang
 */
export function langIsSupported(lang: string): boolean {
  return Object.values(SupportedLanguage).includes(lang as SupportedLanguage);
}
