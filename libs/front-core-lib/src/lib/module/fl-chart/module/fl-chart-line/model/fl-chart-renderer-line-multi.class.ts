import {FlChart2dDatum, FlChart2dDatumSerie, FlChart2dMultipleSerie, FlChart2dSerie} from '../../../model/fl-chart-2d-data.class';
import * as d3 from 'd3';
import {Numeric} from 'd3';
import {FlChart2dRendererMultiple} from '../../../model/fl-chart-2d-renderer.class';
import {FlChartAxisScaleLinear} from '../../../model/fl-chart-scale.class';
import {Selection, ValueFn} from 'd3-selection';


/**
 * Class to manage line chart with multiple series
 */
export class FlChartRendererLineMulti
  extends FlChart2dRendererMultiple<FlChart2dMultipleSerie<FlChart2dDatumSerie>> {

  private readonly serieClassName: string = 'serie';


  initData(container: Selection<Element, null, null, null>,
           data: FlChart2dMultipleSerie<FlChart2dDatumSerie>,
           xScale: FlChartAxisScaleLinear<Numeric>,
           yScale: FlChartAxisScaleLinear<Numeric>): void {
    this.initColor(data);

    container
      .selectAll()
      .data(data.series)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', serie => this.colorScale.scale(serie.serie))
      .attr('class', this.serieClassName)  // I add the class line to be able to modify this line later on.
      .attr('stroke-width', 1.5)
      .attr('d', this.getDValue(xScale, yScale)
      );
  }

  refreshData(container: Selection<Element, null, null, null>,
              data: FlChart2dMultipleSerie<FlChart2dDatumSerie>,
              xScale: FlChartAxisScaleLinear<Numeric>,
              yScale: FlChartAxisScaleLinear<Numeric>): void {
    container
      .selectAll(`.${this.serieClassName}`)
      .transition()
      .attr('d', this.getDValue(xScale, yScale));
  }

  private getDValue(xScale: FlChartAxisScaleLinear<Numeric>,
                    yScale: FlChartAxisScaleLinear<Numeric>): ValueFn<any, FlChart2dSerie<FlChart2dDatumSerie>, any> {
    return (d: FlChart2dSerie<FlChart2dDatumSerie>) => d3.line<FlChart2dDatum>()
      .x((d: FlChart2dDatum) => xScale.scale(d.getX()))
      .y((d: FlChart2dDatum) => yScale.scale(d.getY()))
      (d.getData()); // use to loop through serie's data
  }
}

