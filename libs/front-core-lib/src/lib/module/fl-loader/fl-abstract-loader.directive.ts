import {Directive, Input} from '@angular/core';

/**
 * Abstract directive for loader component, the size can be set with the input or set with CSS. If you
 * set the size with css, also set the min-width and min-height to avoid non circle loader
 *
 * Small : 30px
 *
 * Medium : 50px
 *
 * Large : 100px
 *
 * Extra-large : 150px
 *
 * Custom size in px
 */
@Directive()
export class FlAbstractLoaderDirective {
  @Input() size: 'small' | 'medium' | 'large' | 'extra-large' | number = 'medium';


  get sizeInPixel(): number {
    switch (this.size) {
      case 'small':
        return 30;
      case 'medium':
        return 50;
      case 'large':
        return 100;
      case 'extra-large':
        return 150;
      default:
        return this.size;
    }
  }
}
