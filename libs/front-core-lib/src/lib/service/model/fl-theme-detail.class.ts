/**
 * Detail of a theme containing the colors
 */
export interface FlThemeDetail {
  primary: string;
  accent: string;
  warn: string;
  background: string;
  foreground: string;

  primaryContrast: string;
  accentContrast: string;
  warnContrast: string;

  greyLowContrast: string;
  greyLowContrastText: string;
  greyContrast: string;
  greyContrastText: string;
  greyHighContrast: string;
  greyHighContrastText: string;
}

/**
 * Light theme detail
 */
export const flThemeDetailLight: FlThemeDetail = {
  primary: '#49A8A9',
  accent: '#8751F6',
  warn: '#E28773',
  background: '#F9F8F8',
  foreground: '#010202',

  primaryContrast: '#010202',
  accentContrast: '#E5E5E5',
  warnContrast: '#E5E5E5',

  greyLowContrast: '#ddd',
  greyLowContrastText: '#000000',
  greyContrast: '#bbbbbb',
  greyContrastText: '#000000',
  greyHighContrast: '#808080',
  greyHighContrastText: '#ffffff',
};

/**
 * Dark theme detail
 */
export const flThemeDetailDark: FlThemeDetail = {
  primary: '#49A8A9',
  accent: '#8751F6',
  warn: '#E28773',
  background: '#1B1919',
  foreground: '#E8E8E8',

  primaryContrast: '#010202',
  accentContrast: '#E8E8E8',
  warnContrast: '#010202',

  greyLowContrast: '#545454',
  greyLowContrastText: '#ffffff',
  greyContrast: '#6c6c6c',
  greyContrastText: '#ffffff',
  greyHighContrast: '#808080',
  greyHighContrastText: '#ffffff',
};

/**
 * Object containing class name of the theme
 */
export const flThemeClass = {
  primaryText: 'g-primary-text',
  accentText: 'g-accent-text',
  warnText: 'g-warn-text',
  greyText: 'g-grey-text',

  primaryBackground: 'g-primary-background',
  accentBackground: 'g-accent-background',
  warnBackground: 'g-warn-background',
  greyBackground: 'g-grey-text',


};
