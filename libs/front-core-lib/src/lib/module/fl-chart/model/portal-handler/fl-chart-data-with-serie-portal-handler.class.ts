import {
  FlChartDataWithSeriePortalComponent,
  FlChartDataWithSeriePortalInput
} from '../../component/fl-chart-data-portal/fl-chart-data-with-serie-portal/fl-chart-data-with-serie-portal.component';
import {FlChartDataWithSerie} from '../data/fl-chart-serie.class';
import {FlChartScaleColor} from '../scale/fl-chart-scale-color.class';
import {FlChartPortalHandler} from './fl-chart-portal-handler.class';
import {FlChart2dDatum} from '../data/fl-chart-data.class';
import {FlTagColorer} from '../../../fl-tag/fl-tag-colorer.class';

/**
 * Used to handle opening and closing {@link FlChartDataWithSeriePortalComponent}
 * on chart renderer object with {@link FlChartDataWithSerie}
 */
export class FlChartDataWithSeriePortalHandler {

  private handler: FlChartPortalHandler;

  constructor() {
    this.handler = new FlChartPortalHandler();
  }

  public openPortal(element: Element, d: FlChartDataWithSerie<FlChart2dDatum>, colorScale: FlChartScaleColor,
                    tagColorer?: FlTagColorer): void {
    const data: FlChartDataWithSeriePortalInput = {
      data: d,
      seriesColorScale: colorScale,
      tagColorer: tagColorer
    };
    // create the portal
    this.handler.openPortal(element, FlChartDataWithSeriePortalComponent, data);
  }

  public closePortal(): void {
    this.handler.closePortal();
  }
}
