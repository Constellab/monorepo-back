import {Selection} from 'd3-selection';
import * as d3 from 'd3';
import {FlFileHelper} from '../../../../service/fl-file.helper';

/**
 * Main class to manage the svg for the chart.
 *
 * The svg is the highest container for the chart
 */
export class FlChartSvg {

  public readonly width: number;
  public readonly height: number;

  public svg: Selection<SVGElement, void, null, null>;
  public chartContainer: Selection<SVGElement, void, null, null>;
  public legendContainer: Selection<SVGElement, void, null, null>;
  private container: HTMLElement;

  // height of the legend in px
  private readonly spaceBeforeLegend: number = 10;
  private readonly legendHeight: number = 50;


  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public initSvg(containerElement: HTMLElement): this {
    this.container = containerElement;
    // append the svg object to the body of the page
    this.svg = d3.select<HTMLElement, void>(containerElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.chartContainer = this.svg
      .append('g');

    // create the legend group in the bottom of the chart container
    this.legendContainer = this.svg
      .append('g')
      .attr('transform', `translate(0,${this.chartContainerHeight + this.spaceBeforeLegend})`);


    return this;
  }

  public get chartContainerWidth(): number {
    return this.width;
  }

  public get chartContainerHeight(): number {
    return this.height - (this.legendHeight + this.spaceBeforeLegend);
  }

  public get legendContainerWidth(): number {
    return this.width;
  }

  public get legendContainerHeight(): number {
    return this.legendHeight;
  }


  /**
   * Return the svg html
   */
  public getSVGHTMLContent(): string {
    return this.svg.html();
  }

  /**
   * Download the SVG as file
   * @invertColors if true invert the #000000 colors with #fffff. It is useful for the dark theme
   */
  public downloadSVG(invertColors: boolean = false): void {
    // construct the svg and add the xmlns attribute
    let svg: string = `<svg xmlns="http://www.w3.org/2000/svg">${this.getSVGHTMLContent()}</svg>`;

    if (invertColors) {
      svg = svg.replace(/#000000/g, '_tempUnique_');
      svg = svg.replace(/#ffffff/g, '#000000');
      svg = svg.replace(/_tempUnique_/g, '#ffffff');
    }
    const blob: Blob = new Blob([svg]);
    FlFileHelper.downloadBlob(blob, 'chart.svg');
  }
}

