import {FlChart2dDataContainerI, FlChart2dDatum} from '../../../model/fl-chart-2d-data.class';
import {FlChart2dRenderer, FlChart2dRendererInput} from '../../../model/fl-chart-2d-renderer.class';

export class FlChartRendererScatterPlot
  implements FlChart2dRenderer<FlChart2dDataContainerI<FlChart2dDatum>> {


  initData(input: FlChart2dRendererInput<FlChart2dDataContainerI<FlChart2dDatum>>): void {
    // Add dots
    input.container
      .selectAll()
      .data(input.data.getData())
      .enter()
      .append('circle')
      .attr('r', 1.5)
      .style('fill', '#69b3a2')
      .attr('cx', (d: FlChart2dDatum) => input.xScale.scale(d.getX()))
      .attr('cy', (d: FlChart2dDatum) => input.yScale.scale(d.getY()));
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dDataContainerI<FlChart2dDatum>>): void {
    input.container
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: FlChart2dDatum) => input.xScale.scale(d.getX()))
      .attr('cy', (d: FlChart2dDatum) => input.yScale.scale(d.getY()));
  }

}

