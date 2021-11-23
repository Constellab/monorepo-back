import {FlChartScale, FlChartScaleBand} from '../scale/fl-chart-scale.class';
import {axisBottom, axisLeft, axisRight, axisTop, Numeric} from 'd3';
import {Selection} from 'd3-selection';
import {Axis, AxisScale} from 'd3-axis';
import {FlChartAxisTickFormat} from '../data/fl-chart-data.class';


/**
 * The type define the position of the axis
 */
export type FlChartAxisType = 'left' | 'bottom' | 'right' | 'top';

export class FlChartAxis {

  public scale: FlChartScale;

  public axisContainer: Selection<any, void, null, undefined>;

  protected tickFormat: FlChartAxisTickFormat | null;

  protected readonly type: FlChartAxisType;

  protected zoomDuration: number = 250;

  constructor(type: FlChartAxisType) {
    this.type = type;
  }

  public setScale(scale: FlChartScale): this {
    this.scale = scale.nice();
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
    if (from == null || to == null || isNaN(from) || isNaN(to)) {
      return;
    }

    // update x scale domain
    this.scale.zoom(from, to);

    // Update axis
    this.axisContainer.transition().duration(this.zoomDuration).call(this.createAxis());


  }

  public resetZoom(): void {
    // reset the scale
    this.scale.resetZoom();
    this.scale.nice();
    // recreate the axis
    this.axisContainer.transition().call(this.createAxis());
  }
}

/**
 * Specific axis manager for the axis that use a scale band
 */
export class FlChartAxisBand extends FlChartAxis {

  // readonly info for the tick
  public static readonly tickTextHeight: number = 12;
  // width of 1 character in tick
  public static readonly tickCharacterWidth: number = 5;


  public scale: FlChartScaleBand;


  public setScale(scale: FlChartScaleBand): this {
    return super.setScale(scale);
  }

  /**
   * Configure a smart tick format, it prevent the tick text to get on top of each other
   * It check the bandwidth and compare it with the tick size to decide which tick text to show
   *
   * @param tickSize average size of the tick in px
   * @param tickFormat tick format function
   */
  public setSmartTickFormat(tickSize: number, tickFormat?: FlChartAxisTickFormat): this {

    if (tickFormat == null) {
      tickFormat = (d) => d?.valueOf()?.toString() ?? null;
    }

    this.tickFormat = (d, index) => {
      const bandWidth: number = this.scale.bandwidth();

      // calculate the tick interval
      const tickInterval: number = Math.ceil(tickSize / bandWidth);

      // for each tick interval modulo, display the tick, otherwise show an empty string
      return index % tickInterval === 0 ? tickFormat(d, index) : null;
    };
    return this;
  }


}
