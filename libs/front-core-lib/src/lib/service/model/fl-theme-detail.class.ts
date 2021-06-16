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

  primary100: string;
  primary100Contrast: string;

  greyLowContrast: string;
  greyContrast: string;
  greyHighContrast: string;
}

/**
 * Light theme detail
 */
export const flThemeDetailLight: FlThemeDetail = {
  primary: '#018989',
  accent: '#e0e0e0',
  warn: '#c62828',
  background: '#fafafa',
  foreground: '#000000',

  primaryContrast: '#ffffff',
  accentContrast: '#000000',
  warnContrast: '#ffffff',

  primary100: '#a3bdbd',
  primary100Contrast: '#000000',

  greyLowContrast: '#ddd',
  greyContrast: '#bbbbbb',
  greyHighContrast: 'grey',
};

/**
 * Dark theme detail
 */
export const flThemeDetailDark: FlThemeDetail = {
  primary: '#018989',
  accent: '#e0e0e0',
  warn: '#c62828',
  background: '#303030',
  foreground: '#ffffff',

  primaryContrast: '#ffffff',
  accentContrast: '#000000',
  warnContrast: '#ffffff',

  primary100: '#043e3e',
  primary100Contrast: '#ffffff',

  greyLowContrast: '#545454',
  greyContrast: '#6c6c6c',
  greyHighContrast: 'grey',
};
