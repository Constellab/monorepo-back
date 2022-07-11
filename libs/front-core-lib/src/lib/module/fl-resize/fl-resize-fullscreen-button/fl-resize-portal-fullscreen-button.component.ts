import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {FlResizeDirective} from '../fl-resize/fl-resize.directive';
import {FlHtmlHelper} from '../../../utils/fl-html.helper';
import {flCdkOverlayPanelClass} from '../../../utils/fl-material.config';
import {FlPortalHeaderComponent} from '../../fl-portal/component/fl-portal-header/fl-portal-header.component';

/**
 * Button that work with the directive {@link FlResizeDirective} to enable full screen of a resizable portal
 * It must be placed under the element that has the FlResizeDirective
 */
@Component({
  selector: 'fl-resize-portal-fullscreen-button',
  templateUrl: './fl-resize-portal-fullscreen-button.component.html',
  styleUrls: ['./fl-resize-portal-fullscreen-button.component.scss']
})
export class FlResizePortalFullscreenButtonComponent implements OnInit {

  fullscreen: boolean = false;

  // use to store the width and height before setting full screen
  private previousWidth: number;
  private previousHeight: number;

  // store the original transform of the parent before setting full screen
  private previousParentTransform: string;

  constructor(private resizeDirective: FlResizeDirective,
              private renderer: Renderer2,
              private elementRef: ElementRef<HTMLElement>,
              private portalHeader: FlPortalHeaderComponent) {
  }

  ngOnInit(): void {
  }

  toggleFullscreen(): void {
    this.fullscreen = !this.fullscreen;

    if (this.fullscreen) {
      this.setFullscreen();
    } else {
      this.cancelFullscreen();
    }
  }

  private setFullscreen(): void {
    this.previousWidth = this.resizeDirective.hostWidth;
    this.previousHeight = this.resizeDirective.hostHeight;
    this.resizeDirective.setFullscreen();
    this.updateParentTransform();
  }

  // method to set the transform of the parent to 0 0 0 so the full screen is centered
  private updateParentTransform(): void {
    const parent = this.getParent();
    if (parent) {
      this.previousParentTransform = parent.style.transform;
      this.renderer.setStyle(parent, 'transform', 'translate3d(0px, 0px, 0px)');
      // disable the portal header drag
      this.portalHeader.setEnableDrag(false);
    }

  }

  private cancelFullscreen(): void {
    this.resizeDirective.updateSize(this.previousWidth, this.previousHeight, 'both');
    if (this.previousParentTransform) {
      const parent = this.getParent();
      if (parent) {
        this.renderer.setStyle(parent, 'transform', this.previousParentTransform);
      }
    }
    // enable the portal header drag
    this.portalHeader.setEnableDrag(true);
  }

  private getParent(): HTMLElement {
    return FlHtmlHelper.getParent(this.elementRef.nativeElement, {className: flCdkOverlayPanelClass});
  }

  get icon(): string {
    return this.fullscreen ? 'fullscreen_exit' : 'fullscreen';
  }

  get tooltip(): string {
    return this.fullscreen ? 'flResize.remove_fullscreen' : 'flResize.set_fullscreen';
  }
}
