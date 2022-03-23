import {Selection} from 'd3-selection';
import {FlFileHelper} from '../../../../service/fl-file.helper';
import {select} from 'd3';

/**
 * Main class to manage the svg for the chart.
 *
 * The svg is the highest container for the chart
 */
export class FlChartSvg {


  private _width: number;
  private _height: number;

  public svg: Selection<SVGElement, void, null, null>;
  public chartContainer: Selection<SVGElement, void, null, null>;
  public legendContainer: Selection<SVGElement, void, null, null>;
  private container: HTMLElement;

  // height of the legend in px
  private readonly spaceBeforeLegend: number = 10;
  private readonly legendWidth: number = 100;

  public initSvg(containerElement: HTMLElement): this {
    this.container = containerElement;
    // append the svg object to the body of the page
    this.svg = select<HTMLElement, void>(containerElement)
      .append('svg')
      .attr('width', this._width)
      .attr('height', this._height);

    this.chartContainer = this.svg
      .append('g');

    // create the legend group in the bottom of the chart container
    this.legendContainer = this.svg
      .append('g')
      .attr('transform', `translate(${this.chartContainerWidth + this.spaceBeforeLegend}, 0)`);


    return this;
  }

  get height(): number {
    return this._height;
  }

  get width(): number {
    return this._width;
  }

  public get chartContainerWidth(): number {
    return this._width - (this.legendContainerWidth + this.spaceBeforeLegend);
  }

  public get chartContainerHeight(): number {
    return this._height;
  }

  public get legendContainerWidth(): number {
    return this.legendWidth;
  }

  public get legendContainerHeight(): number {
    return this._height;
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

  // Set the global size of the SVG
  public setSVGSize(width: number, height: number): void {
    this._width = width;
    this._height = height;
  }

  // set the width and height of the chart container element. The legend will be added to the size
  public setChartContainerSize(width: number, height: number): void {
    this.setSVGSize(
      width + this.legendWidth + this.spaceBeforeLegend,
      height);
  }
}

