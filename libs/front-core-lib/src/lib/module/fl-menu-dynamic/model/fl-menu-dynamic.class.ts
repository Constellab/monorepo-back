import {FlTranslatableText} from '../../fl-translate/model/fl-translate-param';

export type FlMenuDynamic = FlMenuDynamicButton | FlMenuDynamicLink;

export class FlMenuDynamicButton {
  type : 'button';
  text: FlTranslatableText;
  subText?: FlTranslatableText;
  icon?: string;
  children?: FlMenuDynamic[];
  onClick?: (event: MouseEvent) => void;
  divider?: boolean; // if true, it adds a divider before the button
  disabled?: boolean;
}

export class FlMenuDynamicLink {
  type : 'link';
  text: FlTranslatableText;
  subText?: FlTranslatableText;
  link: string;
  icon?: string;
  divider?: boolean; // if true, it adds a divider before the button
}
