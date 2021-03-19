import {FlChart2dHistogramDatum} from './fl-chart-2d-data.class';
import {FlChart2d} from './fl-chart-2d.class';


export class FlChart2dHistogram<Datum extends FlChart2dHistogramDatum>
  extends FlChart2d<Datum> {

  constructor(width: number, height: number) {
    super(width, height);
  }

  protected addData(): void {
    this.chartContainer
      .selectAll()
      .data(this.dataContainer.getData())
      .enter()
      .append('rect')
      .attr('x', 1)
      // .each((d) => console.log(d))
      .attr('transform', (d: Datum) => 'translate(' + this.xScale.scale(d.getX1()) + ',' + this.yScale.scale(d.getYCount()) + ')')
      .attr('width', d => this.xScale.scale(d.getX1()) - this.xScale.scale(d.getX0()) - 1)
      .attr('height', d => this.chartHeight - this.yScale.scale(d.getYCount()))
      .style('fill', '#69b3a2');
  }

  protected refreshData(): void {
  }


}
