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
export abstract class FlChartNoAxisRenderer<Data> {

  protected data: FlChartNoAxisRendererInput<Data>;

  abstract renderFirst(): void;

  setData(data: FlChartNoAxisRendererInput<Data>): void {
    this.data = data;
  }
}


/**
 * interface to implement to render graph with 2 axis
 */
export abstract class FlChart2AxisRenderer<Data> extends FlChartNoAxisRenderer<Data> {

  protected data: FlChart2AxisRendererInput<Data>;

  abstract renderFirst(): void;

  abstract refreshRender(): void;
}
