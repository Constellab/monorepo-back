/**
 * Simple interface to define a value that switch between two values depending on the theme
 * Work with {@link FlThemeSwitchPipe}
 */
export interface FlThemeSwitch<T> {
  lightTheme: T;
  darkTheme: T;
}
