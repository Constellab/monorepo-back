import {FlChartScale, FlChartScaleBand} from '../scale/fl-chart-scale.class';
import {axisBottom, axisLeft, axisRight, axisTop, Numeric} from 'd3';
import {Selection} from 'd3-selection';
import {Axis, AxisScale} from 'd3-axis';
import {FlChartAxisTickFormat} from '../data/fl-chart-data.class';
import {ClStringHelper} from '@monorepo/core-lib';
import {FlD3SelectionSimple} from '../fl-d3.class';


/**
 * The type define the position of the axis
 */
export type FlChartAxisType = 'left' | 'bottom' | 'right' | 'top';

export class FlChartAxis {

  // max length of an x rotated tick before it is truncated
  public static xRotateTickMaxLength: number = 25;

  // max length of a y tick before it is truncated
  public static yTickMaxLength: number = 20;


  public scale: FlChartScale;

  public axisContainer: Selection<any, void, null, undefined>;

  protected tickFormat: FlChartAxisTickFormat | null;

  protected readonly type: FlChartAxisType;

  protected zoomDuration: number = 250;

  protected tickTextIsRotated: boolean = false;

  protected maxTickLength: number = null;

  protected label: string;

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

  public rotateTickText(): this {
    this.tickTextIsRotated = true;
    return this;
  }

  public setMaxTickLength(maxTickLength: number): this {
    this.maxTickLength = maxTickLength;
    return this;
  }

  public draw(parent: Selection<any, void, null, undefined>, chartHeight: number, chartWidth: number): void {
    this.axisContainer = parent.append('g')
      .attr('transform', this.getAxisTransform(chartHeight, chartWidth))
      .call(this.createAxis());

    this.drawLabel();
    this.refreshTickLabels();
  }

  // draw the axis label
  private drawLabel(): void {
    if (this.label) {
      if (this.type === 'left') {
        // on top of the axis, centered
        this.axisContainer.append('text')
          .text(this.label.slice(0, 30))
          .attr('x', 0)
          .attr('y', -10)
          .attr('fill', 'currentcolor')
          .attr('text-anchor', 'middle')
          .style('font-size', 10)
          .append('title')
          .text(this.label);
      } else if (this.type === 'bottom') {
        // on axis left, centered vertically
        this.axisContainer.append('text')
          .text(this.label.slice(0, 30))
          .attr('x', -20)
          .attr('y', 17)
          .attr('fill', 'currentcolor')
          .attr('text-anchor', 'end')
          .style('font-size', 10)
          .append('title')
          .text(this.label);
      }
    }
  }

  public setLabel(label: string): this {
    this.label = label;
    return this;
  }

  /**
   * function to Rotate the tick labels and add a title to the label
   * Need to be called each time the zoom is changed
   * @private
   */
  private refreshTickLabels(): void {
    this.refreshTickTextRotation();
    this.refreshTickTitle();
  }

  private refreshTickTextRotation(): void {
    if (this.tickTextIsRotated) {
      this.getTickTextSelection()
        // rotate the text of the legend
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end');
    }
  }

  private refreshTickTitle(): void {
    // add title to tick (only if a tick format exist)
    if (this.tickFormat) {
      this.getTickTextSelection()
        // add a title to each tick
        .append('title')
        .text(this.tickFormat);
    }
  }

  private getTickTextSelection(): FlD3SelectionSimple {
    return this.axisContainer.selectAll('.tick').selectAll('text');
  }

  private createAxis(): Axis<Numeric> {
    const axis: Axis<Numeric> = this.getAxisFactory()(this.scale.d3Scale);

    // set the tick method if exists
    if (this.tickFormat) {
      if (this.maxTickLength != null) {
        // set the tick format method and limit length of tick
        axis.tickFormat((d, index) =>
          ClStringHelper.limiteLength(this.tickFormat(d.valueOf(), index), this.maxTickLength));
      } else {
        axis.tickFormat(this.tickFormat);
      }
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
    this.refreshAxis();
  }

  public resetZoom(): void {
    // reset the scale
    this.scale.resetZoom();
    this.scale.nice();
    this.refreshAxis();
  }

  private refreshAxis(): void {
    // recreate the axis
    this.axisContainer.transition().duration(this.zoomDuration).call(this.createAxis())
      // wait for the end of transition to add the tick title otherwise it is overwritten
      .on('end', () => this.refreshTickTitle());
    // directly rotate the text, this is not overwritten
    this.refreshTickTextRotation();
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
  // width needed by the tick in X when the text is rotated to prevent superposition
  public static readonly tickXRotateWidth: number = FlChartAxisBand.tickCharacterWidth * 3;


  public scale: FlChartScaleBand;


  public setScale(scale: FlChartScaleBand): this {
    return super.setScale(scale);
  }

  /**
   * Configure a smart tick format, it prevents the tick text to get on top of each other
   * It checks the bandwidth and compare it with the tick size to decide which tick text to show
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
