import {Selection} from 'd3-selection';
import {Numeric} from 'd3';
import {FlChartAxisScale} from './fl-chart-scale.class';
import {FlChartScaleColor} from './fl-chart-scale-color.class';
import {FlChart2dMultiSerie} from './data/fl-chart-2d-multi-serie.class';

/**
 * Object needed by the renderer to renderer the chart
 */
export interface FlChart2dRendererInput<Data> {
  container: Selection<Element, null, null, null>;
  data: Data;
  xScale: FlChartAxisScale<Numeric>;
  yScale: FlChartAxisScale<Numeric>;
  chartHeight: number;
  chartWidth: number;
}

/**
 * interface to implement to render graph
 */
export interface FlChart2dRenderer<Data> {


  colorScale: FlChartScaleColor;

  initData(input: FlChart2dRendererInput<Data>): void;

  refreshData(input: FlChart2dRendererInput<Data>): void;
}

/**
 * Render for chart with multiple series
 */
export abstract class FlChart2dRendererMultiple<Data extends FlChart2dMultiSerie<any>>
  implements FlChart2dRenderer<Data> {


  constructor(public colorScale: FlChartScaleColor) {
  }

  abstract initData(input: FlChart2dRendererInput<Data>): void;

  abstract refreshData(input: FlChart2dRendererInput<Data>): void;
}
