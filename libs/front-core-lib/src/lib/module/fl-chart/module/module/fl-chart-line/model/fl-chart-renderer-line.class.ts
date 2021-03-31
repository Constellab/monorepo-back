import * as d3 from 'd3';
import {FlChart2dDataContainerI, FlChart2dDatum} from '../../../../model/fl-chart-2d-data.class';
import {FlChart2dRenderer, FlChart2dRendererInput} from '../../../../model/fl-chart-2d-renderer.class';

export class FlChartRendererLine implements FlChart2dRenderer<FlChart2dDataContainerI<FlChart2dDatum>> {


  initData(input: FlChart2dRendererInput<FlChart2dDataContainerI<FlChart2dDatum>>): void {
    // Add the line
    input.container
      .append('path')
      .datum(input.data.getData())
      .attr('fill', 'none')
      .attr('class', 'line')  // I add the class line to be able to modify this line later on.
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line<FlChart2dDatum>()
        .x((d: FlChart2dDatum) => input.xScale.scale(d.getX()))
        .y((d: FlChart2dDatum) => input.yScale.scale(d.getY()))
      );
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dDataContainerI<FlChart2dDatum>>): void {
    input.container
      .select('path')
      .transition()
      .attr('d', d3.line<FlChart2dDatum>()
        .x(d => input.xScale.scale(d.getX()))
        .y(d => input.yScale.scale(d.getY()))
      );
  }

}
