import {Selection} from 'd3-selection';
import {
  FlChart2AxisRenderer,
  FlChart2AxisRendererInput,
  FlChartNoAxisRenderer,
  FlChartNoAxisRendererInput
} from '../../renderer/fl-chart-renderer.class';
import {FlChartAxis} from './fl-chart-axis.class';
import {ClHelpService} from '@monorepo/core-lib';

interface FlChartContainerMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Chart container, it can contain multiple renderer
 * to be able to show multi chart type in same container
 */
export abstract class FlChartContainer<Data, Renderer extends FlChartNoAxisRenderer<Data> = FlChartNoAxisRenderer<Data>> {
  public group: Selection<any, null, null, null>;
  public chartContainer: Selection<SVGElement, null, null, null>;

  public dataContainer: Data;

  private _groupWidth: number;
  private _groupHeight: number;

  protected renderers: Renderer[] = [];

  public abstract firstChartRendering(): void

  public initData(data: Data): this {
    this.dataContainer = data;
    return this;
  }

  public addRenderer(renderers: Renderer | Renderer[]): this {
    const array: Renderer[] = ClHelpService.convertObjectOrArrayToArray(renderers);
    this.renderers.push(...array);
    return this;
  }

  protected get margin(): FlChartContainerMargin {
    return {top: 0, right: 0, bottom: 0, left: 0};
  }


  public drawChartContainer(parent: Selection<any, any, any, any>): void {
    this.group = parent.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    const clipId = `clip${new Date().getTime()}`;
    this.chartContainer = this.group.append('g')
      .attr('clip-path', `url(#${clipId})`) as any;  // prevent elements to overflow

    // Add a clipPath: everything out of this area won't be drawn.
    this.group.append('defs').append('svg:clipPath')
      .attr('id', clipId)
      .append('svg:rect')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .attr('x', 0)
      .attr('y', 0);
  }

  // Set the width and height of the group element including axis
  public setGroupSize(width: number, height: number): void {
    this._groupWidth = width;
    this._groupHeight = height;
    // trigger the size change event
    this.onSizeChanged();
  }

  // set the width and height, of the chart rendering element and the axis will be added to the size
  public setChartRendererSize(width: number, height: number): void {
    const margin = this.margin;
    this.setGroupSize(
      width + margin.left + margin.right,
      height + margin.top + margin.bottom);
  }

  protected onSizeChanged(): void {
  }

  public sizeIsSet(): boolean {
    return this._groupWidth != null && this._groupHeight != null;
  }

  get groupHeight(): number {
    return this._groupHeight;
  }

  get groupWidth(): number {
    return this._groupWidth;
  }

  public get chartWidth(): number {
    const margin = this.margin;
    return this._groupWidth - margin.left - margin.right;
  }

  public get chartHeight(): number {
    const margin = this.margin;
    return this._groupHeight - margin.top - margin.bottom;
  }
}

/**
 * Chart container with 2 axis on left and bottom
 */
export class FlChartContainer2Axis<Data> extends FlChartContainer<Data, FlChart2AxisRenderer<Data>> {

  public xAxis: FlChartAxis;

  public yAxis: FlChartAxis;

  protected get margin(): FlChartContainerMargin {
    // set some margin so the legends are included
    // noinspection JSSuspiciousNameCombination
    return {top: 20, right: 10, bottom: this.xAxis.getSize(), left: this.yAxis.getSize()};
  }

  public initXAxis(axis: FlChartAxis): this {
    this.xAxis = axis;
    return this;
  }

  public initAxisY(yAxis: FlChartAxis): this {
    this.yAxis = yAxis;
    return this;
  }

  // when the size of the chart change, recalculate the axis ranges
  protected onSizeChanged(): void {
    super.onSizeChanged();
    this.xAxis.scale.range(this.getRangeX());
    this.yAxis.scale.range(this.getRangeY());
  }

  ///////////////////////////////// RENDERING ////////////////////////////

  public firstChartRendering(): void {
    // draw the x and y-axis
    this.xAxis.draw(this.group, this.chartHeight, this.chartWidth);
    this.yAxis.draw(this.group, this.chartHeight, this.chartWidth);

    // render the charts
    this.renderers.forEach(renderer => {
      renderer.setData(this.getRendererInput());
      renderer.renderFirst();
    });
  }

  private refreshChartRendering(): void {
    this.renderers.forEach(renderer => renderer.refreshRender());
  }

  private getRendererInput(): FlChart2AxisRendererInput<Data> {
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

  private getRangeX(): [number, number] {
    return [0, this.chartWidth];
  }

  private getRangeY(): [number, number] {
    return [this.chartHeight, 0];
  }
}

/**
 * Chart container with 0 axis
 */
export class FlChartContainerNoAxis<Data> extends FlChartContainer<Data, FlChartNoAxisRenderer<Data>> {
  public firstChartRendering(): void {
    // render the charts
    this.renderers.forEach(renderer => {
      renderer.setData(this.getRendererInput());
      renderer.renderFirst();
    });
  }

  private getRendererInput(): FlChartNoAxisRendererInput<Data> {
    return {
      container: this.chartContainer,
      data: this.dataContainer,
      chartHeight: this.chartHeight,
      chartWidth: this.chartWidth
    };
  }

}
