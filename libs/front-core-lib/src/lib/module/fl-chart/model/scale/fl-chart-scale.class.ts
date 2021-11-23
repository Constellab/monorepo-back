import {InterpolatorFactory, NumberValue, ScaleBand} from 'd3-scale';
import {AxisScale, interpolateRound, Numeric, scaleBand, scaleLinear} from 'd3';

export interface FlD3Scale<Value> extends AxisScale<Value> {
  (value: Value): number;


  range(): number[];

  range(range: Iterable<number>): this;

  domain(): Value[];

  domain(domain: Iterable<Value>): this;

  copy(): this;

}

export interface FlD3ScaleLinear extends FlD3Scale<number> {

  invert(rangeValue: NumberValue): number;

  ticks(count: number): number[];

  interpolate(interpolate: InterpolatorFactory<any, any>): this;

  nice(count?: number): this;

  // tickValues(values: Value[]): this;
}

export interface FlChartScaleI {
  /**
   * Scale the value
   * @param value
   * @param defaultValue use if the returned value is null
   */
  scale(value: any, defaultValue?: number): any;
}


export abstract class FlChartScale implements FlChartScaleI {

  public readonly d3Scale: FlD3Scale<number>;

  // save the last set domain to be able to reset the domain
  private initialDomain: number[];

  protected constructor() {
    this.d3Scale = this.initScale();
  }

  protected abstract initScale(): FlD3Scale<number>;

  /**
   * Function used to recalibrate the domain (usually for zooming)
   * @param from start position of the new range
   * @param to end position of the new range
   * @protected
   */
  public abstract zoom(from: number, to: number): void;

  /**
   * Reset the zoom by resetting the domain to the initial domain
   */
  public resetZoom(): void {
    this.setD3Domain(this.initialDomain);
  }

  /**
   * Function to extends slightly the domain so all the values are in the graph
   */
  public abstract nice(): this;

  public scale(value: number, defaultValue?: number): number {
    return this.d3Scale(value) ?? defaultValue;
  }


  public range(range: [number, number]): this {
    this.d3Scale.range(range);
    return this;
  }

  public getRange(): [number, number] {
    return this.d3Scale.range() as [number, number];
  }

  /**
   * Init the domain and save the value as initial domain
   * @param domain
   */
  public setInitialDomain(domain: number[]): this {
    this.initialDomain = [...domain];
    return this.setD3Domain(domain);
  }

  protected setD3Domain(domain: number[]): this {
    this.d3Scale.domain(domain);
    return this;
  }

  /////////////////////// GET METHODS ///////////////////////

  public getDomain(): number[] {
    return this.d3Scale.domain();
  }
}

export abstract class FlChartScaleLinear extends FlChartScale {
  public readonly d3Scale: FlD3ScaleLinear;

  protected abstract initScale(): FlD3ScaleLinear;

  /**
   *
   * @param from
   * @param to
   */
  public zoom(from: number, to: number): void {
    // use invert method to get domain value based on position
    this.d3Scale.domain([this.d3Scale.invert(from), this.d3Scale.invert(to)]);
  }

  public invert(rangeValue: number): Numeric {
    return this.d3Scale.invert(rangeValue);
  }

  public ticks(count: number): Numeric[] {
    return this.d3Scale.ticks(count);
  }

  public interpolate(): this {
    this.d3Scale.interpolate(interpolateRound);
    return this;
  }
}


export class FlChartScaleNumber extends FlChartScaleLinear {

  constructor() {
    super();
  }

  protected initScale(): FlD3ScaleLinear {
    return scaleLinear();
  }

  public nice(): this {
    // todo a améliorer car ça ne fonction pas très bien pour les X = 0 1 2 3 4...
    this.d3Scale.nice();
    return this;
  }
}

export class FlChartScaleBand extends FlChartScale {
  public readonly d3Scale: ScaleBand<number>;

  constructor() {
    super();
  }

  protected initScale(): ScaleBand<number> {
    const band: ScaleBand<number> = scaleBand();
    band.paddingInner(0.1);
    return band;
  }

  public bandwidth(): number {
    return this.d3Scale.bandwidth();
  }

  public zoom(from: number, to: number): void {
    const fromDomain: number = this.invertPos(from, true);
    const toDomain: number = this.invertPos(to, false);

    this.setD3Domain(this.getDomain().slice(fromDomain, toDomain + 1));
  }

  public paddingOuter(padding: number): this {
    this.d3Scale.paddingOuter(padding);
    return this;
  }

  public padding(padding: number): this {
    this.d3Scale.padding(padding);
    return this;
  }

  /**
   * Invert a range value
   * @param rangeValue
   * @param roundToNext if true, if the value is in a padding, it is rounded to the next value
   * @private
   */
  private invertPos(rangeValue: number, roundToNext: boolean): number {
    // exclude the outer padding in calcul
    rangeValue = rangeValue - this.outerPaddingWidth;
    const innerPaddingWidth: number = this.innerPaddingWidth;
    const bandWidth: number = this.bandwidth();

    let index: number = 0;
    // IsNan is to prevent infinite loop
    while (!isNaN(rangeValue)) {
      rangeValue -= bandWidth;

      if (rangeValue < 0) {
        return index;
      }

      rangeValue -= innerPaddingWidth;
      // if we match in a padding
      if (rangeValue < 0) {
        return roundToNext ? index + 1 : index;
      }

      index++;
    }

    return index;
  }

  private get outerPaddingWidth(): number {
    // the pos of the first group, indicate the outerpadding
    return this.scale(this.getDomain()[0]) ?? 0;
  }

  private get innerPaddingWidth(): number {
    const domain: Numeric[] = this.getDomain();

    if (domain.length < 2) {
      return 0;
    }
    // compare the position of the first and second group and remove bandwidth to get inner padding width
    return (this.scale(this.getDomain()[1]) - this.scale(this.getDomain()[0]) - this.bandwidth()) ?? 0;
  }

  // do nothing on band, because the domain is already good
  nice(): this {
    return this;
  }


}
