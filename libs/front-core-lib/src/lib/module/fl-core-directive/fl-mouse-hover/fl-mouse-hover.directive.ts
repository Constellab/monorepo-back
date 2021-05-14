import {Directive, ElementRef, Input, Renderer2} from '@angular/core';
import {FlMouseHoverAbstractDirective} from '../../../abstract-directive/mouse-hover/fl-mouse-hover-abstract.directive';
import {ClHelpService} from '@monorepo/core-lib';


/**
 * Event directive that trigger an {@link FlMouseHoverChange} event on hovering status change (enter or leave)
 *
 * A delay can be adding for the event enter event see FlMouseHoverDelay Input
 *
 * Styles or classes can be set to be added during the hover (with the delay)
 */
@Directive({
  selector: '[flMouseHover]'
})
export class FlMouseHoverDirective extends FlMouseHoverAbstractDirective {

  /**
   * If filled the style is added during hover (with the delay) and remove after.
   *
   * The key is the style name and the value the style value
   *
   * Input example : {'backgroundColor': 'red'}
   */
  @Input() flMouseHoverStyle: { [key: string]: string };

  /**
   * If filled the class or classes are added during hover (with the delay) and remove after.
   */
  @Input() flMouseHoverClass: string | string[];

  constructor(elementRef: ElementRef, private renderer: Renderer2) {
    super(elementRef);
  }


  onTriggerHoverEnter(): void {
    // set the style if filled
    if (this.flMouseHoverStyle) {
      this.setStyles(this.flMouseHoverStyle);
    }

    // set the classes if filled
    if (this.flMouseHoverClass) {
      this.setClasses(this.flMouseHoverClass);
    }
  }

  onTriggerHoverLeave(): void {
    // remove the style if exists
    if (this.flMouseHoverStyle) {
      this.removeStyles(this.flMouseHoverStyle);
    }

    // remove the classes if exists
    if (this.flMouseHoverClass) {
      this.removeClasses(this.flMouseHoverClass);
    }
  }


  // on hover enter set the style in parameters to the host element
  private setStyles(style: { [key: string]: string }): void {
    for (const key of Object.keys(style)) {
      this.renderer.setStyle(this.elementRef.nativeElement, key, style[key]);
    }
  }

  // on hover out remove the style in parameters from the host element
  private removeStyles(style: { [key: string]: string }): void {
    for (const key of Object.keys(style)) {
      this.renderer.removeStyle(this.elementRef.nativeElement, key);

    }
  }

  // on hover enter set the class in parameters to the host element
  private setClasses(classes: string | string[]): void {
    for (const className of ClHelpService.convertObjectOrArrayToArray<string>(classes)) {
      this.renderer.addClass(this.elementRef.nativeElement, className);
    }
  }

  // on hover out remove the classes in parameters from the host element
  private removeClasses(classes: string | string[]): void {
    for (const className of ClHelpService.convertObjectOrArrayToArray<string>(classes)) {
      this.renderer.removeClass(this.elementRef.nativeElement, className);
    }
  }
}
