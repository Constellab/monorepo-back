import {Selection} from 'd3-selection';
import * as d3 from 'd3';

/**
 * Main class to manage the svg for the chart.
 *
 * The svg is the highest container for the chart
 */
export class FlChartSvg{

  public readonly width: number;
  public readonly height: number;

  public svg: Selection<SVGElement, void, null, null>;


  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public initSvg(containerElement: HTMLElement): this {
    // append the svg object to the body of the page
    this.svg = d3.select<HTMLElement, void>(containerElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    return this;
  }

}

