import {ConnectedPosition} from '@angular/cdk/overlay';
import {flRootInjector} from '../../../utils/fl-root-injector';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlRelativeOverlayConfig} from '../../fl-portal/model/fl-portal.class';
import {FlPortalConfig} from '../../fl-portal/model/fl-portal-config.class';
import {
  FlChartDataWithSeriePortalComponent,
  FlChartDataWithSeriePortalInput
} from '../module/module/fl-chart-core/component/fl-chart-data-with-serie-portal/fl-chart-data-with-serie-portal.component';
import {FlOverlayRef} from '../../fl-portal/model/fl-overlay-ref.class';
import {FlChartDataWithSerie} from './fl-chart-2d-serie.class';
import {FlChartScaleColor} from './fl-chart-scale-color.class';

/**
 * Used to handle opening and closing {@link FlChartDataWithSeriePortalComponent}
 * on chart renderer object with {@link FlChartDataWithSerie}
 */
export class FlChartDataWithSeriePortalHandler {

  private currentHoverOverlay: FlOverlayRef;

  public openPortal(element: Element, d: FlChartDataWithSerie, colorScale: FlChartScaleColor): void {
    const portalService: FlPortalService = flRootInjector.get(FlPortalService);

    // get the overlay config form config or the default one
    const overlayConfig: FlRelativeOverlayConfig = {
      hasBackdrop: false,
      disposeOnNavigation: true,
      showArrow: false,
      elevation: true,
      panelClass: 'g-portal-panel',
    };

    const position: ConnectedPosition = FlPortalService.getDefaultPosition('top', 0, -10);

    // configure the portal position
    const portalConfig: FlPortalConfig =
      portalService.configureRelativePortal(element, [position], overlayConfig);

    const data: FlChartDataWithSeriePortalInput = {
      data: d,
      seriesColorScale: colorScale
    };
    // create the portal
    this.currentHoverOverlay = portalService.createPortal(FlChartDataWithSeriePortalComponent, portalConfig, data);
  }

  public closePortal(): void {
    this.currentHoverOverlay?.dispose();
    this.currentHoverOverlay = null;
  }
}
