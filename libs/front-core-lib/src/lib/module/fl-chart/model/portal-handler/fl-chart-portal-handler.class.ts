import {ComponentType, ConnectedPosition} from '@angular/cdk/overlay';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {flRootInjector} from '../../../../utils/fl-root-injector';
import {FlRelativeOverlayConfig} from '../../../fl-portal/model/fl-portal.class';
import {FlPortalConfig} from '../../../fl-portal/model/fl-portal-config.class';

/**
 * Used to opening and closing portal
 * on chart renderer object
 */
export class FlChartPortalHandler {

  private currentHoverOverlay: FlOverlayRef;

  public openPortal(element: Element, component: ComponentType<any>, data: any): void {
    const portalService: FlPortalService = flRootInjector.get(FlPortalService);

    // get the overlay config form config or the default one
    const overlayConfig: FlRelativeOverlayConfig = {
      hasBackdrop: false,
      disposeOnNavigation: true,
      showArrow: false,
      elevation: true,
      panelClass: 'g-portal-panel',
    };

    const positions: ConnectedPosition[] = [
      FlPortalService.getDefaultPosition('top', 0, -10),
      FlPortalService.getDefaultPosition('right', 10, 0),
      FlPortalService.getDefaultPosition('left', -10, 0),
      FlPortalService.getDefaultPosition('bottom', 0, 10),
    ];

    // configure the portal position
    const portalConfig: FlPortalConfig =
      portalService.configureRelativePortal(element, positions, overlayConfig);

    // create the portal
    this.currentHoverOverlay = portalService.createPortal(component, portalConfig, data);
  }

  public closePortal(): void {
    this.currentHoverOverlay?.dispose();
    this.currentHoverOverlay = null;
  }
}
