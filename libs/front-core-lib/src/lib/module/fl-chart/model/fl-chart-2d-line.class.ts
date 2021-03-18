import * as d3 from 'd3';
import {FlChart2dDatum} from './fl-chart-2d-data.class';
import {FlChart2d} from './fl-chart-2d.class';

export class FlChart2dLine<Datum extends FlChart2dDatum>
  extends FlChart2d<Datum> {

  constructor(width: number, height: number) {
    super(width, height);
  }


  protected addData(): void {
    this.xScale.scale(this.dataContainer.getData()[0].getX());

    // Add the line
    this.chartContainer
      .append('path')
      .datum(this.dataContainer.getData())
      .attr('fill', 'none')
      .attr('class', 'line')  // I add the class line to be able to modify this line later on.
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line<FlChart2dDatum>()
        .x((d: FlChart2dDatum) => this.xScale.scale(d.getX()))
        .y((d: FlChart2dDatum) => this.yScale.scale(d.getY()))
      );

  }

  protected refreshData(): void {
    this.chartContainer
      .select('path')
      .transition()
      .attr('d', d3.line<Datum>()
        .x(d => this.xScale.scale(d.getX()))
        .y(d => this.yScale.scale(d.getY()))
      );
  }




}
