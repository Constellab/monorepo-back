/**
 * List of languages supported by the application
 */
export enum ClSupportedLanguage {
  en = 'en',
  fr = 'fr',
}

export const CL_DEFAULT_LANG: ClSupportedLanguage = ClSupportedLanguage.en;

/**
 * Name of the cookie that contains the lang
 */
export const CL_LANG_COOKIE: string = 'lang';

/**
 * Return true if the string lang is a supported lang
 */
export function clLangIsSupported(lang: string): boolean {
  return Object.values(ClSupportedLanguage).includes(lang as ClSupportedLanguage);
}

/**
 * Map to map the language code with language name in the language
 */
export const CL_LANG_NAME_MAP: Record<ClSupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
};
