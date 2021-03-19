import * as d3 from 'd3';
import {Numeric} from 'd3';
import {FlChart2dDataContainerI, FlChart2dDatum} from '../../../model/fl-chart-2d-data.class';
import {FlChart2dRenderer} from '../../../model/fl-chart-2d-renderer.class';
import {FlChartAxisScaleLinear} from '../../../model/fl-chart-scale.class';
import {Selection} from 'd3-selection';

export class FlChartRendererLine implements FlChart2dRenderer<FlChart2dDataContainerI<FlChart2dDatum>> {


  initData(container: Selection<Element, null, null, null>, data: FlChart2dDataContainerI<FlChart2dDatum>,
           xScale: FlChartAxisScaleLinear<Numeric>,
           yScale: FlChartAxisScaleLinear<Numeric>): void {
    // Add the line
    container
      .append('path')
      .datum(data.getData())
      .attr('fill', 'none')
      .attr('class', 'line')  // I add the class line to be able to modify this line later on.
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line<FlChart2dDatum>()
        .x((d: FlChart2dDatum) => xScale.scale(d.getX()))
        .y((d: FlChart2dDatum) => yScale.scale(d.getY()))
      );
  }

  refreshData(container: Selection<Element, null, null, null>, data: FlChart2dDataContainerI<FlChart2dDatum>,
              xScale: FlChartAxisScaleLinear<Numeric>, yScale: FlChartAxisScaleLinear<Numeric>): void {
    container
      .select('path')
      .transition()
      .attr('d', d3.line<FlChart2dDatum>()
        .x(d => xScale.scale(d.getX()))
        .y(d => yScale.scale(d.getY()))
      );
  }

}
