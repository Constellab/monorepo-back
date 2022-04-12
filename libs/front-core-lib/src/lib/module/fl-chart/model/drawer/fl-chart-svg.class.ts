import {Selection} from 'd3-selection';
import {FlFileHelper} from '../../../../service/fl-file.helper';
import {select} from 'd3';
import {FlChartSVGLegend} from '../legend/fl-chart-legend.class';

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
  private container: HTMLElement;


  public initSvg(containerElement: HTMLElement): this {
    this.container = containerElement;
    // append the svg object to the body of the page
    this.svg = select<HTMLElement, void>(containerElement)
      .append('svg')
      .attr('width', this._width)
      .attr('height', this._height);

    this.chartContainer = this.svg
      .append('g');

    return this;
  }

  get height(): number {
    return this._height;
  }

  get width(): number {
    return this._width;
  }

  public get chartContainerWidth(): number {
    return this._width;
  }

  public get chartContainerHeight(): number {
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
  public downloadSVG(svgLegend?: FlChartSVGLegend, invertColors: boolean = false): void {
    // height of the legend in px
    const legendMargin: number = 10;
    const svgLegendWidth: number = 100;

    // create a new svg element
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    // copy innerHTML to new svg
    svgElement.innerHTML = this.getSVGHTMLContent();

    // generate the legend in svg
    if (svgLegend) {
      const legendContainer = select(svgElement)
        .append('g')
        .attr('transform', `translate(${this.chartContainerWidth + legendMargin}, ${legendMargin})`);
      svgLegend.renderLegend(legendContainer, svgLegendWidth, this._height - legendMargin);
    }

    // retrieve html as string
    let stringSvg = svgElement.outerHTML;

    // invert colors if necessary
    if (invertColors) {
      stringSvg = stringSvg.replace(/#000000/g, '_tempUnique_');
      stringSvg = stringSvg.replace(/#ffffff/g, '#000000');
      stringSvg = stringSvg.replace(/_tempUnique_/g, '#ffffff');
    }
    const blob: Blob = new Blob([stringSvg]);
    FlFileHelper.downloadBlob(blob, 'chart.svg');
  }

  // Set the global size of the SVG
  public setSVGSize(width: number, height: number): void {
    this._width = width;
    this._height = height;
  }
}

