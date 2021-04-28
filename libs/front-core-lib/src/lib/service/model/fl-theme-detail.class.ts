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
}

/**
 * Light theme detail
 */
export const flThemeDetailLight: FlThemeDetail = {
  primary: '#018989',
  accent: '#e0e0e0',
  warn: '#c62828',
  background: '#fafafa',
  foreground: 'black',

  primaryContrast: 'white',
  accentContrast: 'black',
  warnContrast: 'white'
};

/**
 * Dark theme detail
 */
export const flThemeDetailDark: FlThemeDetail = {
  primary: '#018989',
  accent: '#e0e0e0',
  warn: '#c62828',
  background: '#303030',
  foreground: 'white',

  primaryContrast: 'white',
  accentContrast: 'black',
  warnContrast: 'white'
};
