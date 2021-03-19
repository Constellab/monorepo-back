import {Selection} from 'd3-selection';
import {Numeric} from 'd3';
import {FlChartAxisScaleLinear} from './fl-chart-scale.class';
import {FlChart2dDatumSerie, FlChart2dMultipleSerie} from './fl-chart-2d-data.class';
import {FlChartScaleColor} from './fl-chart-scale-color.class';


export interface FlChart2dRenderer<Data> {

  initData(container: Selection<Element, null, null, null>,
           data: Data,
           xScale: FlChartAxisScaleLinear<Numeric>,
           yScale: FlChartAxisScaleLinear<Numeric>): void;

  refreshData(container: Selection<Element, null, null, null>,
              data: Data,
              xScale: FlChartAxisScaleLinear<Numeric>,
              yScale: FlChartAxisScaleLinear<Numeric>): void;
}


export abstract class FlChart2dRendererMultiple<Data extends FlChart2dMultipleSerie<any>>
  implements FlChart2dRenderer<Data> {

  protected colorScale: FlChartScaleColor;

  abstract initData(container: Selection<Element, null, null, null>,
           data: Data,
           xScale: FlChartAxisScaleLinear<Numeric>,
           yScale: FlChartAxisScaleLinear<Numeric>): void;

  abstract refreshData(container: Selection<Element, null, null, null>,
              data: Data,
              xScale: FlChartAxisScaleLinear<Numeric>,
              yScale: FlChartAxisScaleLinear<Numeric>): void;

  protected initColor(series: FlChart2dMultipleSerie<FlChart2dDatumSerie>): this {
    this.colorScale = new FlChartScaleColor().domain(series.series.map(d => d.serie));
    return this;
  }
}
