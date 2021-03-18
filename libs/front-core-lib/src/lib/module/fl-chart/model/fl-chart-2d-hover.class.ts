import {FlChart2d} from './fl-chart-2d.class';
import {Selection} from 'd3-selection';
import * as d3 from 'd3';

export abstract class FlChart2dHover {

  protected chart: FlChart2d<any>;

  protected constructor(chart: FlChart2d<any>) {
    this.chart = chart;
    this.initHover();
  }

  private initHover(): void {
    this.chartContainer
      .attr('pointer-events', 'all')
      .on('mouseout', (event: any, d: any) => this.onMouseOut(event, d))
      .on('mouseover', (event: any, d: any) => this.onMouseOver(event, d))
      .on('mousemove', (event: any, d: any) => this.onMouseMove(event, d));
  }

  get chartContainer(): Selection<any, any, null, null> {
    return this.chart.chartContainer;
  }

  protected abstract onMouseOut(event: MouseEvent, d: any): void;

  protected abstract onMouseOver(event: MouseEvent, d: any): void;

  protected abstract onMouseMove(event: MouseEvent, d: any): void;
}


export class FlChart2dHoverLine extends FlChart2dHover {

  private readonly verticalLineClass = 'mouse-vertical-line';

  constructor(chart: FlChart2d<any>) {
    super(chart);
    this.init();
  }

  private init(): void {
    // this is the black vertical line to follow mouse
    this.chartContainer.append('path')
      .attr('class', this.verticalLineClass)
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('opacity', '0');
  }

  protected onMouseMove(event: MouseEvent): void {
    const mouse: [number, number] = d3.pointer(event);
    this.getVerticalLine()
      .attr('d', () => {
        // height is from 0 to height, and x is from mouse[o] event
        // todo see to improve, we shift the list to 1px so the brush selection still works if there is a brush
        return 'M' + (mouse[0] + 1) + ',' + this.chart.chartHeight
          +  ' ' + (mouse[0] + 1) + ',' + 0;
      })
  }

  protected onMouseOut(): void {
    // hide the vertical line
    this.getVerticalLine().style('opacity', '0');
  }

  protected onMouseOver(): void {
    // show the vertical line
    this.getVerticalLine().style('opacity', '1');
  }

  private getVerticalLine(): Selection<any, any, any, any>{
    return this.chartContainer.select(`.${this.verticalLineClass}`);
  }

}
