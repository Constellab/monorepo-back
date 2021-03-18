import {Selection} from 'd3-selection';
import * as d3 from 'd3';
import {FlChartAxisScale} from './fl-chart-scale.class';
import {FlChart2dDataContainer, FlChart2dDatum} from './fl-chart-2d-data.class';
import {Numeric} from 'd3';

export abstract class FlChart2d<Datum extends FlChart2dDatum> {

  private readonly svgWidth: number;
  private readonly svgHeight: number;

  private margin = {top: 10, right: 30, bottom: 30, left: 40};


  public svg: Selection<SVGElement, void, null, null>;

  // todo a voir, en vrai c'est null les values, c'est le path fils qui les as
  public chartContainer: Selection<SVGElement, Datum[], null, null>;

  public xScale: FlChartAxisScale<Numeric>;

  public yScale: FlChartAxisScale<Numeric>;

  public xAxis: Selection<any, void, null, undefined>;

  public yAxis: Selection<any, void, null, undefined>;

  protected dataContainer: FlChart2dDataContainer<Datum>;

  public zoomTransitionDuration: number = 250;

  protected constructor(width: number, height: number) {
    this.svgWidth = width;
    this.svgHeight = height;
  }

  public initData(data: FlChart2dDataContainer<Datum>): this {
    this.dataContainer = data;
    this.addData();
    return this;
  }

  protected abstract addData(): void;

  // refresh the chart data based on xScale and yScale
  protected abstract refreshData(): void;

  public initSvg(containerElement: HTMLElement): this {
    // append the svg object to the body of the page
    this.svg = d3.select<HTMLElement, void>(containerElement)
      .append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.chartContainer = this.svg.append('g')
      .attr('clip-path', 'url(#clip)') as any;  // prevent line to overflow

    // Add a clipPath: everything out of this area won't be drawn.
    this.svg.append('defs').append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .attr('x', 0)
      .attr('y', 0);

    return this;
  }

  public initX(scale: FlChartAxisScale<Numeric>): this {
    this.xScale = scale;

    this.xAxis = this.svg.append('g')
      .attr('transform', 'translate(0,' + this.chartHeight + ')')
      .call(d3.axisBottom(scale.d3Scale));

    return this;
  }

  public initY(scale: FlChartAxisScale<Numeric>): this {
    this.yScale = scale;

    this.yAxis = this.svg.append('g')
      .call(d3.axisLeft(scale.d3Scale));

    return this;
  }

  public get chartWidth(): number {
    return this.svgWidth - this.margin.left - this.margin.right;
  }

  public get chartHeight(): number {
    return this.svgHeight - this.margin.top - this.margin.bottom;
  }

  ///////////////////////////////// ZOOM ////////////////////////////////

  public zoom(fromX: number, toX: number,
              fromY: number, toY: number): void {
    if (fromX == null || toX == null || fromY == null || toY == null) {
      return;
    }

    this.zoomXAxis(fromX, toX);
    this.zoomYAxis(fromY, toY);
    this.refreshData();
  }

  public resetZoom(): void {
    this.resetAxisX();
    this.resetAxisY();
    this.refreshData();
  }


  ///////////////////////////////// ZOOM X ////////////////////////////////

  public zoomX(from: number, to: number): void {
    if (from == null || to == null) {
      return;
    }

    this.zoomXAxis(from, to);
    this.refreshData();
  }

  private zoomXAxis(from: number, to: number): void {
    // update x scale domain
    this.xScale.domain([this.xScale.invert(from), this.xScale.invert(to)]);

    // Update axis and line position
    this.xAxis.transition().duration(this.zoomTransitionDuration).call(d3.axisBottom(this.xScale.d3Scale));
  }

  public resetZoomX(): void {
    this.resetAxisX();
    this.refreshData();
  }

  private resetAxisX(): void {
    this.xScale.domain(this.dataContainer.getExtentX());
    this.xAxis.transition().call(d3.axisBottom(this.xScale.d3Scale));
  }

  public getRangeX(): [number, number]{
    return [0, this.chartWidth];
  }

  ///////////////////////////////////////// ZOOM Y //////////////////////////////////
  public zoomY(from: number, to: number): void {
    if (from == null || to == null) {
      return;
    }

    this.zoomYAxis(from, to);
    this.refreshData();
  }

  private zoomYAxis(from: number, to: number): void {
    // update x scale domain
    this.yScale.domain([this.yScale.invert(to), this.yScale.invert(from)]);

    // Update axis and line position
    this.yAxis.transition().duration(this.zoomTransitionDuration).call(d3.axisLeft(this.yScale.d3Scale));
  }

  public resetZoomY(): void {
    this.resetAxisY();
    this.refreshData();
  }

  private resetAxisY(): void {
    this.yScale.domain(this.dataContainer.getExtentY());
    this.yAxis.transition().call(d3.axisLeft(this.yScale.d3Scale));
  }

  public getRangeY(): [number, number]{
    return [this.chartHeight, 0];
  }
}

