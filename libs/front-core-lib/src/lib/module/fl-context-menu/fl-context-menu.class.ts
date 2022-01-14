import {FlTranslatableText} from '../fl-translate/model/fl-translate-param';

/**
 * Config object for the Context menu
 */
export interface FlContextMenuConfig {
  buttons: FlContextMenuButton[];
}

/**
 * Configuration for one button in the Context Menu
 */
export interface FlContextMenuButton {
  text: FlTranslatableText;
  icon: string;
  onClick: (event: MouseEvent) => any;
  divider?: boolean; // if true, it adds a divider before the button
  disabled?: boolean;
}
