import {FlChartContainer} from './drawer/fl-chart-container.class';
import {FlChartLegend} from './legend/fl-chart-legend.class';
import {FlChartBrush} from './drawer/fl-chart-brush.class';

/**
 * Config object to draw a new chart
 */
export class FlChartConfig {

  chartContainer: FlChartContainer<any>;
  legend?: FlChartLegend;
  zoomBrush?: FlChartBrush;
}


export abstract class FlChartConfig2 {
  abstract getChartContainer(): FlChartContainer<any>;

  abstract getLegend(): FlChartLegend;

  abstract getZoomBrush(): FlChartBrush;
}
