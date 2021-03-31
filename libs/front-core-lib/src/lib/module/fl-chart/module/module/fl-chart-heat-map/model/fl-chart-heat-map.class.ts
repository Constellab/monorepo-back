import {FlChartHeatMapDatum} from '../../../../model/fl-chart-2d-data.class';
import {FlChartAxisScaleBand} from '../../../../model/fl-chart-scale.class';

export class FlChartHeatMap<Datum extends FlChartHeatMapDatum> {


  public xScale: FlChartAxisScaleBand;

  public yScale: FlChartAxisScaleBand;

  private colorScale: any;

  // protected addData(): void {
  //   this.chartContainer.selectAll()
  //     .data(this.dataContainer.getData())
  //     .enter()
  //     .append('rect')
  //     .attr('x', d => this.xScale.scale(d.getX()))
  //     .attr('y', d => this.yScale.scale(d.getY()))
  //     .attr('width', this.xScale.bandwidth())
  //     .attr('height', this.yScale.bandwidth())
  //     .style('fill', d => this.colorScale(d.getValue()));
  // }
  //
  // protected refreshData(): void {
  // }
  //
  // public initColor(): void {
  //   // Build color scale
  //   this.colorScale = d3.scaleLinear<string>()
  //     .range(['white', '#69b3a2'])
  //     .domain([1, 100]);
  // }
}
