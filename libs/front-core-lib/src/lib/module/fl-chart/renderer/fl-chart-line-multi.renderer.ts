import {FlChart2dDatum} from '../model/fl-chart-2d-data.class';
import * as d3 from 'd3';
import {Numeric} from 'd3';
import {FlChart2dRendererInput, FlChart2dRendererMultiple} from '../model/fl-chart-2d-renderer.class';
import {FlChartAxisScale} from '../model/fl-chart-scale.class';
import {ValueFn} from 'd3-selection';
import {FlChart2dSerie} from '../model/fl-chart-2d-serie.class';
import {FlChart2dMultiSerie} from '../model/fl-chart-2d-multi-serie.class';


/**
 * Class to manage line chart with multiple series
 */
export class FlChartLineMultiRenderer
  extends FlChart2dRendererMultiple<FlChart2dMultiSerie<FlChart2dDatum>> {

  private readonly serieClassName: string = 'serie';


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
                    yScale: FlChartAxisScale<Numeric>): ValueFn<any, FlChart2dSerie<FlChart2dDatum>, any> {
    return (d: FlChart2dSerie<FlChart2dDatum>) => d3.line<FlChart2dDatum>()
      .x((d: FlChart2dDatum) => xScale.scale(d.getX()))
      .y((d: FlChart2dDatum) => yScale.scale(d.getY()))
      (d.getData()); // use to loop through serie's data
  }
}
