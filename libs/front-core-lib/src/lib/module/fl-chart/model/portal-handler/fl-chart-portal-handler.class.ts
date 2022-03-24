import {ComponentType, ConnectedPosition} from '@angular/cdk/overlay';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {flRootInjector} from '../../../../utils/fl-root-injector';
import {FlRelativeOverlayConfig} from '../../../fl-portal/model/fl-portal.class';
import {FlPortalConfig} from '../../../fl-portal/model/fl-portal-config.class';
import {NgZone, RendererFactory2} from '@angular/core';

/**
 * Used to opening and closing portal
 * on chart renderer object
 */
export class FlChartPortalHandler {

  private currentHoverOverlay: FlOverlayRef;

  private portalFixed: boolean = false;

  private clickListener: () => void;

  public openPortal(element: Element, component: ComponentType<any>, data: any): void {

    this.closePortal(true);
    this.portalFixed = false;

    const portalService: FlPortalService = flRootInjector.get(FlPortalService);
    const ngZone: NgZone = flRootInjector.get(NgZone);

    // get the overlay config form config or the default one
    const overlayConfig: FlRelativeOverlayConfig = {
      hasBackdrop: false,
      disposeOnNavigation: true,
      showArrow: false,
      elevation: true,
      panelClass: 'g-portal-background',
    };

    const positions: ConnectedPosition[] = [
      FlPortalService.getDefaultPosition('right', 10, 0),
      FlPortalService.getDefaultPosition('top', 0, -10),
      FlPortalService.getDefaultPosition('left', -10, 0),
      FlPortalService.getDefaultPosition('bottom', 0, 10),
    ];

    // configure the portal position
    const portalConfig: FlPortalConfig =
      portalService.configureRelativePortal(element, positions, overlayConfig);

    // run the portal in NgZone because all the chart is outside zone
    ngZone.run(() => {
      // create the portal
      this.currentHoverOverlay = portalService.createPortal(component, portalConfig, data);
      this.currentHoverOverlay.detachments().subscribe(() => this.clearListener());
    });
  }

  /**
   * Fix the portal. Once fixed, the portal will only be close if closeFixedPortal is set to true when closing
   * or the user click elsewhere
   */
  public fixPortal(): void {
    this.portalFixed = true;
    const rendererFactory: RendererFactory2 = flRootInjector.get(RendererFactory2);
    const renderer = rendererFactory.createRenderer(null, null);

    // use a timeout before adding the click listener, otherwise it closes it directly
    setTimeout(() => {
      this.clickListener = renderer.listen('body', 'click', () => {
        this.closePortal(true);
      });
    }, 0);
  }

  public closePortal(closeFixedPortal: boolean = false): void {
    if (!closeFixedPortal && this.portalFixed) return;
    this.currentHoverOverlay?.dispose();
    this.currentHoverOverlay = null;
  }

  private clearListener(): void {
    if (this.clickListener) {
      this.clickListener();
    }
  }
}
