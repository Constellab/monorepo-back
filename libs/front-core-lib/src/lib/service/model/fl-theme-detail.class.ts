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
  greyLowContrastText: '#ffffff',
  greyContrast: '#6c6c6c',
  greyContrastText: '#ffffff',
  greyHighContrast: '#808080',
  greyHighContrastText: '#ffffff',
};
