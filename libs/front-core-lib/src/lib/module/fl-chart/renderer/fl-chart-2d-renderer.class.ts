import {Selection} from 'd3-selection';
import {Numeric} from 'd3';
import {FlChartScale} from '../model/scale/fl-chart-scale.class';

/**
 * Object needed by the renderer to renderer the chart
 */
export interface FlChart2dRendererInput<Data> {
  container: Selection<Element, null, null, null>;
  data: Data;
  xScale: FlChartScale<Numeric>;
  yScale: FlChartScale<Numeric>;
  chartHeight: number;
  chartWidth: number;
}

/**
 * interface to implement to render graph
 */
export interface FlChart2dRenderer<Data> {

  initData(input: FlChart2dRendererInput<Data>): void;

  refreshData(input: FlChart2dRendererInput<Data>): void;
}
