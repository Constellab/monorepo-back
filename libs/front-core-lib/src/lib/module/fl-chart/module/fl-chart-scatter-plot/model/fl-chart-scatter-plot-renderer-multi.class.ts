import {FlChart2dDatumSerie, FlChart2dMultipleSerie} from '../../../model/fl-chart-2d-data.class';
import {FlChart2dRendererMultiple} from '../../../model/fl-chart-2d-renderer.class';
import {FlChartAxisScaleLinear} from '../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {Selection} from 'd3-selection';

export class FlChartScatterPlotRendererMulti
  extends FlChart2dRendererMultiple<FlChart2dMultipleSerie<FlChart2dDatumSerie>> {


  initData(container: Selection<Element, null, null, null>,
           data: FlChart2dMultipleSerie<FlChart2dDatumSerie>,
           xScale: FlChartAxisScaleLinear<Numeric>,
           yScale: FlChartAxisScaleLinear<Numeric>): void {
    this.initColor(data);
    // Add dots
    container
      // generate groups for the series
      .selectAll()
      .data(data.series)
      .enter()
      .append('g')

      // for each group, generate the circle
      .selectAll()
      .data((d) => d.getData())
      .enter()
      .append('circle')
      .attr('r', 1.5)
      .style('fill', '#69b3a2')
      .style('fill', (d: FlChart2dDatumSerie) => this.colorScale.scale(d.getSerie()))
      .attr('cx', (d: FlChart2dDatumSerie) => xScale.scale(d.getX()))
      .attr('cy', (d: FlChart2dDatumSerie) => yScale.scale(d.getY()));
  }

  refreshData(container: Selection<Element, null, null, null>,
              data: FlChart2dMultipleSerie<FlChart2dDatumSerie>,
              xScale: FlChartAxisScaleLinear<Numeric>,
              yScale: FlChartAxisScaleLinear<Numeric>): void {
    container
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: FlChart2dDatumSerie) => xScale.scale(d.getX()))
      .attr('cy', (d: FlChart2dDatumSerie) => yScale.scale(d.getY()));
  }

}
