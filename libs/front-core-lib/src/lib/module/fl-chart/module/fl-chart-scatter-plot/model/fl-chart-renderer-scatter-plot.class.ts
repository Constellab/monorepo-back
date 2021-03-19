import {FlChart2dDataContainerI, FlChart2dDatum} from '../../../model/fl-chart-2d-data.class';
import {FlChart2dRenderer} from '../../../model/fl-chart-2d-renderer.class';
import {Selection} from 'd3-selection';
import {FlChartAxisScaleLinear} from '../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';

export class FlChartRendererScatterPlot
  implements FlChart2dRenderer<FlChart2dDataContainerI<FlChart2dDatum>> {


  initData(container: Selection<Element, null, null, null>,
           data: FlChart2dDataContainerI<FlChart2dDatum>,
           xScale: FlChartAxisScaleLinear<Numeric>,
           yScale: FlChartAxisScaleLinear<Numeric>): void {
    // Add dots
    container
      .selectAll()
      .data(data.getData())
      .enter()
      .append('circle')
      .attr('r', 1.5)
      .style('fill', '#69b3a2')
      .attr('cx', (d: FlChart2dDatum) => xScale.scale(d.getX()))
      .attr('cy', (d: FlChart2dDatum) => yScale.scale(d.getY()));
  }

  refreshData(container: Selection<Element, null, null, null>,
              data: FlChart2dDataContainerI<FlChart2dDatum>,
              xScale: FlChartAxisScaleLinear<Numeric>,
              yScale: FlChartAxisScaleLinear<Numeric>): void {
    container
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: FlChart2dDatum) => xScale.scale(d.getX()))
      .attr('cy', (d: FlChart2dDatum) => yScale.scale(d.getY()));
  }

}

