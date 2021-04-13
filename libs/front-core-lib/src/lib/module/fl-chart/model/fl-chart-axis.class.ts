import {FlChartAxisScale} from './fl-chart-scale.class';
import {axisBottom, axisLeft, axisRight, axisTop, Numeric} from 'd3';
import {Selection} from 'd3-selection';
import {Axis, AxisScale} from 'd3-axis';
import {FlChartAxisTickFormat} from './fl-chart-2d-data.class';


/**
 * The type define the position of the axis
 */
export type FlChartAxisType = 'left' | 'bottom' | 'right' | 'top';

export class FlChartAxis {

  public scale: FlChartAxisScale<Numeric>;

  public axisContainer: Selection<any, void, null, undefined>;

  private tickFormat: FlChartAxisTickFormat | null;

  private readonly type: FlChartAxisType;

  private zoomDuration: number = 250;

  constructor(type: FlChartAxisType) {
    this.type = type;
  }

  public setScale(scale: FlChartAxisScale<Numeric>): this {
    this.scale = scale;
    return this;
  }

  public setTickFormat(tickFormat: FlChartAxisTickFormat): this {
    this.tickFormat = tickFormat;
    return this;
  }

  public setZoomDuration(duration: number): this {
    this.zoomDuration = duration;
    return this;
  }

  public create(parent: Selection<any, void, null, undefined>, chartHeight: number, chartWidth: number): this {
    this.axisContainer = parent.append('g')
      .attr('transform', this.getAxisTransform(chartHeight, chartWidth))
      .call(this.createAxis());

    return this;
  }

  private createAxis(): Axis<Numeric> {
    const axis: Axis<Numeric> = this.getAxisFactory()(this.scale.d3Scale);

    // set the tick method if exists
    if (this.tickFormat) {
      axis.tickFormat(this.tickFormat);
    }

    return axis;
  }

  private getAxisFactory(): (scale: AxisScale<Numeric>) => Axis<Numeric> {
    switch (this.type) {
      case 'left':
        return axisLeft;
      case 'bottom':
        return axisBottom;
      case 'right':
        return axisRight;
      case 'top':
        return axisTop;
    }
  }

  /**
   * Get the transform to position the axis base on axis type
   * @param chartHeight
   * @param chartWidth
   * @private
   */
  private getAxisTransform(chartHeight: number, chartWidth: number): string {
    switch (this.type) {
      case 'left':
        return 'translate(0,0)';
      case 'bottom':
        return 'translate(0,' + chartHeight + ')';
      case 'right':
        return 'translate(' + chartWidth + ',0)';
      case 'top':
        return 'translate(0,0)';
    }
  }


  ///////////////////////////////// ZOOM ////////////////////////////////

  public zoom(from: number, to: number): void {
    if (from == null || to == null) {
      return;
    }

    // update x scale domain
    this.scale.zoom(from, to);

    // Update axis
    this.axisContainer.transition().duration(this.zoomDuration).call(this.createAxis());
  }

  public resetZoom(domain: Numeric[]): void {
    // reset the scale
    this.scale.domain(domain);
    // recreate the axis
    this.axisContainer.transition().call(this.createAxis());
  }


}
