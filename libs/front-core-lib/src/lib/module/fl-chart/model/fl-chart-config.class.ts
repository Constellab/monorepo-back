import {FlChartContainer} from './drawer/fl-chart-container.class';
import {FlChartLegend} from './legend/fl-chart-legend.class';
import {FlChartBrush} from './drawer/fl-chart-brush.class';

/**
 * Config object to draw a new chart
 */
export abstract class FlChartConfig {
  abstract getChartContainer(): FlChartContainer<any>;

  abstract getLegend(): FlChartLegend;

  abstract getZoomBrush(): FlChartBrush;
}
