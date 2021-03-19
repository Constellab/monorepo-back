import {FlChart2dHistoDataContainer, FlChart2dHistogramDatum} from '../../../model/fl-chart-2d-data.class';
import {FlChart2dRenderer} from '../../../model/fl-chart-2d-renderer.class';
import {FlChartAxisScaleLinear} from '../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {Selection} from 'd3-selection';


export class FlChart2dHistogram
  implements FlChart2dRenderer<FlChart2dHistoDataContainer<FlChart2dHistogramDatum>> {


  initData(container: Selection<Element, null, null, null>,
           data: FlChart2dHistoDataContainer<FlChart2dHistogramDatum>,
           xScale: FlChartAxisScaleLinear<Numeric>,
           yScale: FlChartAxisScaleLinear<Numeric>): void {
    container
      .selectAll()
      .data(data.getData())
      .enter()
      .append('rect')
      .attr('x', 1)
      // .each((d) => console.log(d))
      .attr('transform', (d: FlChart2dHistogramDatum) => 'translate(' + xScale.scale(d.getX1()) + ',' + yScale.scale(d.getYCount()) + ')')
      .attr('width', d => xScale.scale(d.getX1()) - xScale.scale(d.getX0()) - 1)
      // todo voir comment passer le chartHeight
      .attr('height', d => this.chartHeight - yScale.scale(d.getYCount()))
      .style('fill', '#69b3a2');
  }

  refreshData(container: Selection<Element, null, null, null>,
              data: FlChart2dHistoDataContainer<FlChart2dHistogramDatum>,
              xScale: FlChartAxisScaleLinear<Numeric>,
              yScale: FlChartAxisScaleLinear<Numeric>): void {
  }
}
