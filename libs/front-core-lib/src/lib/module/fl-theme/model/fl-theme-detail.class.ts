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

  cardBackground: string;
  hover: string;
}

/**
 * Light theme detail
 */
export const flThemeDetailLight: FlThemeDetail = {
  primary: '#49A8A9',
  accent: '#6C4EF6',
  warn: '#F991C3',
  background: '#F9F8F8',
  foreground: '#010202',

  primaryContrast: '#010202',
  accentContrast: '#E5E5E5',
  warnContrast: '#E5E5E5',

  cardBackground: '#EAEAEA',
  hover: '#D2D2D2'
};

/**
 * Dark theme detail
 */
export const flThemeDetailDark: FlThemeDetail = {
  primary: '#49A8A9',
  accent: '#6C4EF6',
  warn: '#F991C3',
  background: '#1B1919',
  foreground: '#E8E8E8',

  primaryContrast: '#010202',
  accentContrast: '#E8E8E8',
  warnContrast: '#010202',

  cardBackground: '#2B2D2E',
  hover: '#3A3D3D'
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
