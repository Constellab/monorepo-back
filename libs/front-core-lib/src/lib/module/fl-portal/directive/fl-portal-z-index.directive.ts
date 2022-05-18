import {Directive, ElementRef, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import {FlHtmlHelper} from '../../../utils/fl-html.helper';

/**
 * Directive for portal to move the portal on top of other portal when clicking on it.
 */
@Directive({
  selector: '[flPortalZIndex]'
})
export class FlPortalZIndexDirective implements OnInit {

  @Input() flPortalZIndexDisabled: boolean = false;

  private readonly className = 'g-overlay-z-index';
  private overlayElement: HTMLElement;

  @HostListener('mousedown')
  click(): void {
    this.updateZIndex();
  }


  constructor(private elementRef: ElementRef<HTMLElement>,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.overlayElement = this.getOverlayElement();

    if (this.overlayElement) {
      this.renderer.addClass(this.overlayElement, this.className);
    }
  }


  private updateZIndex(): void {
    if (this.flPortalZIndexDisabled) return;

    if (this.overlayElement == null || this.overlayElement.parentElement == null) return;


    // check if the overlay has a sibling annotated with the class
    let hasNextSibling = false;
    let sibling: HTMLElement = this.renderer.nextSibling(this.overlayElement);
    while (sibling) {

      if (sibling.classList && sibling.classList.contains(this.className)) {
        hasNextSibling = true;
        break;
      }
      sibling = this.renderer.nextSibling(sibling);
    }

    // if there is a sibling, we need to move the overlay on top of it
    if (hasNextSibling) {
      // move the element as last sibling
      this.renderer.appendChild(this.overlayElement.parentElement, this.overlayElement);
    }
  }


  private getOverlayElement(): HTMLElement | null {
    return FlHtmlHelper.getParent(this.elementRef.nativeElement, {className: 'cdk-global-overlay-wrapper'});
  }

}
