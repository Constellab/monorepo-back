import {FlChartContainer} from './drawer/fl-chart-container.class';
import {FlChartSVGLegend} from './legend/fl-chart-legend.class';
import {FlChartBrush} from './drawer/fl-chart-brush.class';
import {Type} from '@angular/core';
import {FlChartRightSectionDirective} from '../component/fl-chart-right-section/fl-chart-right-section.directive';

/**
 * Configuration to create the component for the right section of the chart (usually the legend)
 */
export interface FlChartRightSectionConfig {
  componentType: Type<FlChartRightSectionDirective>;
  data: any; // data to pass to the component
}

/**
 * Config object to draw a new chart
 */
export abstract class FlChartConfig {
  abstract getChartContainer(): FlChartContainer<any>;

  abstract getLegendConfig(): FlChartRightSectionConfig;

  abstract getSVGLegend(): FlChartSVGLegend;

  abstract getZoomBrush(): FlChartBrush;
}
