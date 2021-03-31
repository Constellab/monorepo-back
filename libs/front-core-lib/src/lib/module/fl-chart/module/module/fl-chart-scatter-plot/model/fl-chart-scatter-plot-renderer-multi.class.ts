import {FlChart2dDatum, FlChart2dMultipleSerie, FlChartDataWithSerie} from '../../../../model/fl-chart-2d-data.class';
import {FlChart2dRendererInput, FlChart2dRendererMultiple} from '../../../../model/fl-chart-2d-renderer.class';

export class FlChartScatterPlotRendererMulti
  extends FlChart2dRendererMultiple<FlChart2dMultipleSerie<FlChart2dDatum>> {


  initData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {
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
      .data((d) => d.getDataWithSerie())
      .enter()
      .append('circle')
      .attr('r', 1.5)
      .style('fill', (d: FlChartDataWithSerie) => this.colorScale.scale(d.serieKey))
      .attr('cx', (d: FlChartDataWithSerie) => input.xScale.scale(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie) => input.yScale.scale(d.data.getY()));
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {
    input.container
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: FlChartDataWithSerie) => input.xScale.scale(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie) => input.yScale.scale(d.data.getY()));
  }

}
