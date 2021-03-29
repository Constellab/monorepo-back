import {Selection} from 'd3-selection';
import {Numeric} from 'd3';
import {FlChartAxisScaleLinear} from './fl-chart-scale.class';
import {FlChart2dDatumSerie, FlChart2dMultipleSerie} from './fl-chart-2d-data.class';
import {FlChartScaleColor} from './fl-chart-scale-color.class';

/**
 * Object needed by the renderer to renderer the chart
 */
export interface FlChart2dRendererInput<Data> {
  container: Selection<Element, null, null, null>;
  data: Data;
  xScale: FlChartAxisScaleLinear<Numeric>;
  yScale: FlChartAxisScaleLinear<Numeric>;
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


export abstract class FlChart2dRendererMultiple<Data extends FlChart2dMultipleSerie<any>>
  implements FlChart2dRenderer<Data> {

  protected colorScale: FlChartScaleColor;

  abstract initData(input: FlChart2dRendererInput<Data>): void;

  abstract refreshData(input: FlChart2dRendererInput<Data>): void;

  protected initColor(series: FlChart2dMultipleSerie<FlChart2dDatumSerie>): this {
    this.colorScale = new FlChartScaleColor().domain(series.series.map(d => d.serie));
    return this;
  }
}
