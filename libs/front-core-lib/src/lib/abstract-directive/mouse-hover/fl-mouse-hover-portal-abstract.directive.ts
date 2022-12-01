import {Directive, ElementRef, Input, OnDestroy, Renderer2} from '@angular/core';
import {FlMouseHoverAbstractDirective} from './fl-mouse-hover-abstract.directive';
import {FlRelativeOverlayConfig} from '../../module/fl-portal/model/fl-portal.class';
import {FlOverlayRef} from '../../module/fl-portal/model/fl-overlay-ref.class';
import {FlPortalService} from '../../module/fl-portal/service/fl-portal.service';
import {FlPortalConfig} from '../../module/fl-portal/model/fl-portal-config.class';
import {FlMouseHoverPortalConfig} from './fl-mouse-hover-portal.config';


/**
 * Abstract class for directive to define a directive that will open a portal when the
 * user is hovering the host element
 */
@Directive()
export abstract class FlMouseHoverPortalAbstractDirective extends FlMouseHoverAbstractDirective implements OnDestroy {

  /**
   *  if true doesn't display the detail on the hover
   */
  @Input() flDisableHover: boolean = false;

  // current overlay if portal is open
  protected currentOverlay: FlOverlayRef;

  private listener: () => void;

  constructor(elementRef: ElementRef,
              protected portalService: FlPortalService,
              private render: Renderer2) {
    super(elementRef);
  }

  /**
   * Get the config for the portal to open. In config is null the portal is not opened
   */
  abstract getConfig(): FlMouseHoverPortalConfig | null;

  abstract onPortalOpened(overlay: FlOverlayRef, event: MouseEvent): void;

  abstract onPortalClosed(event: MouseEvent): void;

  onTriggerHoverEnter(event: MouseEvent): void {
    this.openPortal(event);
  }

  onTriggerHoverLeave(event: MouseEvent): void {
    this.checkAndCloseDetail(event);
  }

  private openPortal(event: MouseEvent): void {
    if (this.flDisableHover || this.currentOverlay) {
      return;
    }

    // get the directive config
    const config: FlMouseHoverPortalConfig = this.getConfig();

    if (config == null) {
      return;
    }

    // get the overlay config form config or the default one
    const overlayConfig: FlRelativeOverlayConfig = config.overlayConfig ?? {
      hasBackdrop: false,
      disposeOnNavigation: true,
      showArrow: false,
      scrollStrategy: this.portalService.getCloseOnScrollStrategy()
    };

    // configure the portal position
    const portalConfig: FlPortalConfig =
      this.portalService.configureRelativePortal(this.elementRef.nativeElement, config.position, overlayConfig);
    // create the portal
    this.currentOverlay = this.portalService.createPortal(config.component, portalConfig, config.data);

    // notify child the portal is open
    this.onPortalOpened(this.currentOverlay, event);
  }

  // close the overlay on mouse out of the current card and the portal
  private checkAndCloseDetail(event: MouseEvent): void {
    // get the directive config
    const config: FlMouseHoverPortalConfig = this.getConfig();

    if (config == null || this.currentOverlay == null) {
      return;
    }

    let element: HTMLElement = event.relatedTarget as HTMLElement;

    // check if the destination target is a child of the detail portal
    while (element != null && element.tagName !== 'BODY') {
      // if this is a child of the detail portal, don't close the portal
      if (element.tagName === config.portalTagName) {
        this.addPortalMouseLeaveEvent(element, event);
        return;
      }
      // check the parent
      element = element.parentElement;
    }

    this.closePortal(event);
  }

  // dispose the portal
  private closePortal(event: MouseEvent): void {
    if (this.currentOverlay) {
      this.currentOverlay.dispose();
      this.currentOverlay = null;
      this.onPortalClosed(event);
    }
    this.clearListener();
  }

  // once the mouse entered the portal, it will be closed when the mouse leaves it
  private addPortalMouseLeaveEvent(element: HTMLElement, event: MouseEvent): void {
    if (this.listener == null) {
      this.listener = this.render.listen(element, 'mouseleave', () => this.closePortal(event));
    }
  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.clearListener();
  }

  private clearListener(): void {
    if (this.listener) {
      this.listener();
      this.listener = null;
    }

  }
}
