import {FlChart2dDatum} from '../model/data/fl-chart-data.class';
import * as d3 from 'd3';
import {Numeric} from 'd3';
import {FlChart2dRenderer, FlChart2dRendererInput} from '../model/fl-chart-2d-renderer.class';
import {FlChartAxisScale} from '../model/fl-chart-scale.class';
import {ValueFn} from 'd3-selection';
import {FlChartSerie} from '../model/data/fl-chart-serie.class';
import {FlChart2dMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartScaleColor} from '../model/fl-chart-scale-color.class';


/**
 * Class to manage line chart with multiple series
 */
export class FlChartLineMultiRenderer
  implements FlChart2dRenderer<FlChart2dMultiSerie<FlChart2dDatum>> {

  private readonly serieClassName: string = 'serie';

  constructor(public colorScale: FlChartScaleColor) {
  }

  initData(input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    input.container
      .selectAll()
      .data(input.data.series)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', serie => this.colorScale.scale(serie.key))
      .attr('class', this.serieClassName)  // I add the class line to be able to modify this line later on.
      .attr('stroke-width', 1.5)
      .attr('d', this.getDValue(input.xScale, input.yScale)
      );
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    input.container
      .selectAll(`.${this.serieClassName}`)
      .transition()
      .attr('d', this.getDValue(input.xScale, input.yScale));
  }

  private getDValue(xScale: FlChartAxisScale<Numeric>,
                    yScale: FlChartAxisScale<Numeric>): ValueFn<any, FlChartSerie<FlChart2dDatum>, any> {
    return (d: FlChartSerie<FlChart2dDatum>) => d3.line<FlChart2dDatum>()
      .x((d: FlChart2dDatum) => xScale.scale(d.getX()))
      .y((d: FlChart2dDatum) => yScale.scale(d.getY()))
      (d.getData()); // use to loop through serie's data
  }
}
