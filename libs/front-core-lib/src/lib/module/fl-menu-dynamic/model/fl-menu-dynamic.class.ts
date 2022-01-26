import {FlTranslatableText} from '../../fl-translate/model/fl-translate-param';

export class FlMenuDynamic {
  text: FlTranslatableText;
  icon?: string;
  children?: FlMenuDynamic[];
  onClick?: (event: MouseEvent) => void;
  divider?: boolean; // if true, it adds a divider before the button
  disabled?: boolean;
}
