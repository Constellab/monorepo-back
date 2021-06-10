import {Selection} from 'd3-selection';
import {FlChart2dRenderer, FlChart2dRendererInput} from './fl-chart-2d-renderer.class';
import {FlChart2dDataContainerI} from './fl-chart-2d-data.class';
import {FlChartAxis} from './fl-chart-axis.class';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Chart container, it can contains multiple renderer
 * to be able to show multi chart type in same container
 */
export abstract class FlChartContainer<Data> {

  public group: Selection<any, null, null, null>;
  public chartContainer: Selection<SVGElement, null, null, null>;

  public dataContainer: Data;

  protected readonly groupWidth: number;
  protected readonly groupHeight: number;

  protected renderers: FlChart2dRenderer<Data>[];


  // margin for the axis
  private margin = {top: 10, right: 30, bottom: 30, left: 40};

  constructor(parent: Selection<any, any, any, any>, width: number, height: number) {
    this.groupWidth = width;
    this.groupHeight = height;
    this.renderers = [];
    this.initChart(parent);
  }

  protected abstract firstChartRendering(): void

  public initData(data: Data): this {
    this.dataContainer = data;
    this.firstChartRendering();
    return this;
  }

  public addRenderer(renderers: FlChart2dRenderer<Data> | FlChart2dRenderer<Data>[]): this {
    const array: FlChart2dRenderer<Data>[] = ClHelpService.convertObjectOrArrayToArray(renderers);
    this.renderers.push(...array);
    return this;
  }


  private initChart(parent: Selection<any, any, any, any>): this {
    this.group = parent.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.chartContainer = this.group.append('g')
      .attr('clip-path', 'url(#clip)') as any;  // prevent line to overflow

    // Add a clipPath: everything out of this area won't be drawn.
    this.group.append('defs').append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .attr('x', 0)
      .attr('y', 0);

    return this;
  }



  public get chartWidth(): number {
    return this.groupWidth - this.margin.left - this.margin.right;
  }

  public get chartHeight(): number {
    return this.groupHeight - this.margin.top - this.margin.bottom;
  }
}

/**
 * Chart container for 2d chart with 2 axis
 */
export class FlChartContainer2d<Data extends FlChart2dDataContainerI<any>> extends FlChartContainer<Data> {

  public xAxis: FlChartAxis;

  public yAxis: FlChartAxis;


  public zoomTransitionDuration: number = 250;


  public initXAxis(axis: FlChartAxis): this {
    this.xAxis = axis.setZoomDuration(this.zoomTransitionDuration)
      .create(this.group, this.chartHeight, this.chartWidth);

    return this;
  }

  public initAxisY(yAxis: FlChartAxis): this {
    this.yAxis = yAxis.setZoomDuration(this.zoomTransitionDuration)
      .create(this.group, this.chartHeight, this.chartWidth);

    return this;
  }


  ///////////////////////////////// RENDERING ////////////////////////////

  protected firstChartRendering(): void {
    this.renderers.forEach(renderer => renderer.initData(this.getRendererInput()));
  }

  private refreshChartRendering(): void {
    this.renderers.forEach(renderer => renderer.refreshData(this.getRendererInput()));
  }

  private getRendererInput(): FlChart2dRendererInput<Data> {
    return {
      container: this.chartContainer,
      data: this.dataContainer,
      xScale: this.xAxis.scale,
      yScale: this.yAxis.scale,
      chartHeight: this.chartHeight,
      chartWidth: this.chartWidth
    };
  }

  ///////////////////////////////// ZOOM ////////////////////////////////

  public zoom(fromX: number, toX: number,
              fromY: number, toY: number): void {
    if (fromX == null || toX == null || fromY == null || toY == null) {
      return;
    }

    this.zoomXAxis(fromX, toX);
    this.zoomYAxis(fromY, toY);
    this.refreshChartRendering();
  }

  public resetZoom(): void {
    this.resetAxisX();
    this.resetAxisY();
    this.refreshChartRendering();
  }


  ///////////////////////////////// ZOOM X ////////////////////////////////

  public zoomX(from: number, to: number): void {
    if (from == null || to == null) {
      return;
    }

    this.zoomXAxis(from, to);
    this.refreshChartRendering();
  }

  private zoomXAxis(from: number, to: number): void {
    this.xAxis.zoom(from, to);
  }

  public resetZoomX(): void {
    this.resetAxisX();
    this.refreshChartRendering();
  }

  private resetAxisX(): void {
    this.xAxis.resetZoom();
  }

  ///////////////////////////////////////// ZOOM Y //////////////////////////////////
  public zoomY(from: number, to: number): void {
    if (from == null || to == null) {
      return;
    }

    this.zoomYAxis(from, to);
    this.refreshChartRendering();
  }

  private zoomYAxis(from: number, to: number): void {
    this.yAxis.zoom(to, from);
  }

  public resetZoomY(): void {
    this.resetAxisY();
    this.refreshChartRendering();
  }

  private resetAxisY(): void {
    this.yAxis.resetZoom();
  }

  ///////////////////////////////////////// OTHER //////////////////////////////////

  public getRangeX(): [number, number] {
    return [0, this.chartWidth];
  }

  public getRangeY(): [number, number] {
    return [this.chartHeight, 0];
  }
}
