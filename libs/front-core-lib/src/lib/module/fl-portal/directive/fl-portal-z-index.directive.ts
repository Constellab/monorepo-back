import {Directive, ElementRef, HostListener, Input, Renderer2} from '@angular/core';
import {FlHtmlHelper} from '../../../utils/fl-html.helper';

/**
 * Directive for portal to move the portal on top of other portal when clicking on it.
 */
@Directive({
  selector: '[flPortalZIndex]'
})
export class FlPortalZIndexDirective {

  @Input() flPortalZIndexDisabled: boolean = false;

  @HostListener('mousedown')
  click(): void {
    this.updateZIndex();
  }

  constructor(private elementRef: ElementRef<HTMLElement>,
              private renderer: Renderer2) {
  }


  private updateZIndex(): void {
    if (this.flPortalZIndexDisabled) return;
    const element = this.getOverlayElement();

    if (element == null || element.parentElement == null) return;

    // do nothing is this is the last sibling
    if (this.renderer.nextSibling(element) == null) return;

    // move the element as last sibling
    this.renderer.appendChild(element.parentElement, element);
  }


  private getOverlayElement(): HTMLElement | null {
    return FlHtmlHelper.getParent(this.elementRef.nativeElement, {className: 'cdk-global-overlay-wrapper'});
  }

}
