import {FlChartContainer} from './drawer/fl-chart-container.class';
import {FlChartLegend} from './legend/fl-chart-legend.class';

/**
 * Config object to draw a new chart
 */
export class FlChartConfig {

  chartContainer: FlChartContainer<any>;
  legend?: FlChartLegend;
  zoomEnabled: boolean;
}
