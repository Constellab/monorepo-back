import {FlChart2dDatum} from '../model/data/fl-chart-data.class';
import {line} from 'd3';
import {FlChart2AxisRenderer, FlChart2AxisRendererInput} from './fl-chart-renderer.class';
import {FlChartScale} from '../model/scale/fl-chart-scale.class';
import {ValueFn} from 'd3-selection';
import {FlChartSerie} from '../model/data/fl-chart-serie.class';
import {FlChart2dMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';


/**
 * Class to manage line chart with multiple series
 */
export class FlChartRendererLine implements FlChart2AxisRenderer<FlChart2dMultiSerie<FlChart2dDatum>> {

  private readonly serieClassName: string = 'serie';

  constructor(public colorScale: FlChartScaleColor) {
  }

  initData(input: FlChart2AxisRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
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

  refreshData(input: FlChart2AxisRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    input.container
      .selectAll(`.${this.serieClassName}`)
      .transition()
      .attr('d', this.getDValue(input.xScale, input.yScale));
  }

  private getDValue(xScale: FlChartScale,
                    yScale: FlChartScale): ValueFn<any, FlChartSerie<FlChart2dDatum>, any> {
    return (d: FlChartSerie<FlChart2dDatum>) => line<FlChart2dDatum>()
      .x((d: FlChart2dDatum) => xScale.scale(d.getX()))
      .y((d: FlChart2dDatum) => yScale.scale(d.getY()))
      (d.getValidData()); // use to loop through serie's data
  }
}
