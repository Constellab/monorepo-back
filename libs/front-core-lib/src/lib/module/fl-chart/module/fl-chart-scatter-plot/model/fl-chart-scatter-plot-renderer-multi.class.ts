import {FlChart2dDatumSerie, FlChart2dMultipleSerie} from '../../../model/fl-chart-2d-data.class';
import {FlChart2dRendererInput, FlChart2dRendererMultiple} from '../../../model/fl-chart-2d-renderer.class';

export class FlChartScatterPlotRendererMulti
  extends FlChart2dRendererMultiple<FlChart2dMultipleSerie<FlChart2dDatumSerie>> {


  initData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatumSerie>>): void {
    this.initColor(input.data);
    // Add dots
    input.container
      // generate groups for the series
      .selectAll()
      .data(input.data.series)
      .enter()
      .append('g')

      // for each group, generate the circle
      .selectAll()
      .data((d) => d.getData())
      .enter()
      .append('circle')
      .attr('r', 1.5)
      .style('fill', (d: FlChart2dDatumSerie) => this.colorScale.scale(d.getSerie()))
      .attr('cx', (d: FlChart2dDatumSerie) => input.xScale.scale(d.getX()))
      .attr('cy', (d: FlChart2dDatumSerie) => input.yScale.scale(d.getY()));
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatumSerie>>): void {
    input.container
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: FlChart2dDatumSerie) => input.xScale.scale(d.getX()))
      .attr('cy', (d: FlChart2dDatumSerie) => input.yScale.scale(d.getY()));
  }

}
