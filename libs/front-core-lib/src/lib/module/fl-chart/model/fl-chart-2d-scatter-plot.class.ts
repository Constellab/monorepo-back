import {FlChart2dDatum} from './fl-chart-2d-data.class';
import {FlChart2d} from './fl-chart-2d.class';

export class FlChart2dScatterPlot<Datum extends FlChart2dDatum>
  extends FlChart2d<Datum> {

  constructor(width: number, height: number) {
    super(width, height);
  }

  protected addData(): void {
    // Add dots
    this.chartContainer
      .selectAll()
      .data(this.dataContainer.getData())
      .enter()
      .append('circle')
      .attr('r', 1.5)
      .style('fill', '#69b3a2')
      .attr('cx', (d: Datum) => this.xScale.scale(d.getX()))
      .attr('cy', (d: Datum) => this.yScale.scale(d.getY()));
  }

  protected refreshData(): void {
    this.chartContainer
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: Datum) => this.xScale.scale(d.getX()))
      .attr('cy', (d: Datum) => this.yScale.scale(d.getY()));
  }
}

