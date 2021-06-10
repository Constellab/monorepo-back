import {
  FlChartDataWithSeriePortalComponent,
  FlChartDataWithSeriePortalInput
} from '../../module/module/fl-chart-core/component/fl-chart-data-with-serie-portal/fl-chart-data-with-serie-portal.component';
import {FlChartDataWithSerie} from '../fl-chart-2d-serie.class';
import {FlChartScaleColor} from '../fl-chart-scale-color.class';
import {FlChartPortalHandler} from './fl-chart-portal-handler.class';

/**
 * Used to handle opening and closing {@link FlChartDataWithSeriePortalComponent}
 * on chart renderer object with {@link FlChartDataWithSerie}
 */
export class FlChartDataWithSeriePortalHandler {

  private handler: FlChartPortalHandler;

  constructor() {
    this.handler = new FlChartPortalHandler();
  }

  public openPortal(element: Element, d: FlChartDataWithSerie, colorScale: FlChartScaleColor): void {
    const data: FlChartDataWithSeriePortalInput = {
      data: d,
      seriesColorScale: colorScale
    };
    // create the portal
    this.handler.openPortal(element, FlChartDataWithSeriePortalComponent, data);
  }

  public closePortal(): void {
    this.handler.closePortal();
  }
}
