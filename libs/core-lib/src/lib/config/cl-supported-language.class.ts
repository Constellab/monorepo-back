/**
 * List of languages supported by the application
 */
export enum ClSupportedLanguage {
  en = 'en',
  fr = 'fr'
}

export const clDefaultLang: ClSupportedLanguage = ClSupportedLanguage.en;

/**
 * Name of the cookie that contains the lang
 */
export const clLangCookie: string = 'lang';

/**
 * Return true if the string lang is a supported lang
 */
export function clLangIsSupported(lang: string): boolean {
  return Object.values(ClSupportedLanguage).includes(lang as ClSupportedLanguage);
}

/**
 * Map to map the language code with language name in the language
 */
export const clLangNameMap: Record<ClSupportedLanguage, string> = {
  en: 'English',
  fr: 'Français'
};
