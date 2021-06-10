import {Selection} from 'd3-selection';
import * as d3 from 'd3';
import {FlFileHelper} from '../../../service/fl-file.helper';

/**
 * Main class to manage the svg for the chart.
 *
 * The svg is the highest container for the chart
 */
export class FlChartSvg {

  public readonly width: number;
  public readonly height: number;

  public svg: Selection<SVGElement, void, null, null>;
  private container: HTMLElement;


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

    return this;
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

