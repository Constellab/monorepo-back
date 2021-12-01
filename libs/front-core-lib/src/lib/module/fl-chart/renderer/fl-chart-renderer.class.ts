import {Selection} from 'd3-selection';
import {FlChartScale} from '../model/scale/fl-chart-scale.class';


/**
 * Object needed by the renderer to renderer the chart
 */
export interface FlChartNoAxisRendererInput<Data> {
  container: Selection<Element, null, null, null>;
  data: Data;
  chartHeight: number;
  chartWidth: number;
}

/**
 * Object needed by the renderer to renderer the charts with 2 axis
 */
export interface FlChart2AxisRendererInput<Data> extends FlChartNoAxisRendererInput<Data> {
  xScale: FlChartScale;
  yScale: FlChartScale;
}

/**
 * interface to implement to render graph without axis
 */
export interface FlChartNoAxisRenderer<Data> {

  initData(input: FlChartNoAxisRendererInput<Data>): void;
}


/**
 * interface to implement to render graph with 2 axis
 */
export interface FlChart2AxisRenderer<Data> {

  initData(input: FlChart2AxisRendererInput<Data>): void;

  refreshData(input: FlChart2AxisRendererInput<Data>): void;
}
