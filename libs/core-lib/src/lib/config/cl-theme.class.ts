/**
 * Available theme for the app
 */
export enum ClTheme {
  LIGHT_THEME = 'light-theme',
  DARK_THEME = 'dark-theme'
}

export const clDefaultTheme: ClTheme = ClTheme.LIGHT_THEME;

/**
 * Return true if the string theme is a theme
 */
export function clThemeIsSupported(theme: string): boolean {
  return Object.values(ClTheme).includes(theme as ClTheme);
}
