import {InterpolatorFactory, NumberValue, ScaleBand} from 'd3-scale';
import * as d3 from 'd3';
import {AxisScale, interpolateRound, Numeric} from 'd3';

export interface FlD3AxisScale<Value> extends AxisScale<Value> {
  (value: Value): number;


  range(): number[];

  range(range: Iterable<number>): this;

  domain(): Value[];

  domain(domain: Iterable<Value>): this;

  copy(): this;

}

export interface FlD3AxisScaleLinear<Value extends Numeric> extends FlD3AxisScale<Value> {

  invert(rangeValue: NumberValue): Value;

  ticks(count: number): Value[];

  interpolate(interpolate: InterpolatorFactory<any, any>): this;

  nice(count?: number): this;

  // tickValues(values: Value[]): this;
}


export abstract class FlChartAxisScale<Value> {

  public readonly d3Scale: FlD3AxisScale<Value>;

  protected constructor() {
    this.d3Scale = this.initScale();
  }

  protected abstract initScale(): FlD3AxisScale<Value>;

  /**
   * Function used to recalibrate the domain (usually for zooming)
   * @param from start position of the new range
   * @param to end position of the new range
   * @protected
   */
  public abstract zoom(from: number, to: number): void;

  /**
   * Function to extends slightly the domain so all the values are in the graph
   */
  public abstract nice(): this;

  public scale(value: Value): number {
    return this.d3Scale(value);
  }


  public range(range: [number, number]): this {
    this.d3Scale.range(range);
    return this;
  }

  public getRange(): [number, number] {
    return this.d3Scale.range() as [number, number];
  }

  public domain(domain: Value[]): this {
    this.d3Scale.domain(domain);
    return this;
  }


  public simpleDomain(from: Value, to: Value): this {
    return this.domain([from, to]);
  }

  /////////////////////// GET METHODS ///////////////////////

  public getDomain(): Value[] {
    return this.d3Scale.domain();
  }
}

// todo est-ce qu'on garde le generic ?
export abstract class FlChartAxisScaleLinear<Value extends Numeric> extends FlChartAxisScale<Value> {
  public readonly d3Scale: FlD3AxisScaleLinear<Value>;

  protected abstract initScale(): FlD3AxisScaleLinear<Value>;

  /**
   *
   * @param from
   * @param to
   */
  public zoom(from: number, to: number): void {
    // use invert method to get domain value based on position
    this.d3Scale.domain([this.d3Scale.invert(from), this.d3Scale.invert(to)]);
  }

  public invert(rangeValue: number): Value {
    return this.d3Scale.invert(rangeValue);
  }

  public ticks(count: number): Value[] {
    return this.d3Scale.ticks(count);
  }

  public interpolate(): this {
    this.d3Scale.interpolate(interpolateRound);
    return this;
  }
}


export class FlChartAxisScaleDate extends FlChartAxisScaleLinear<Numeric> {

  constructor() {
    super();
  }

  protected initScale(): FlD3AxisScaleLinear<Date> {
    return d3.scaleTime();
  }


  public nice(): this {
    this.d3Scale.nice(1);
    return this;
  }
}

export class FlChartAxisScaleNumber extends FlChartAxisScaleLinear<Numeric> {

  constructor() {
    super();
  }

  protected initScale(): FlD3AxisScaleLinear<Numeric> {
    return d3.scaleLinear();
  }

  public nice(): this {
    // todo a améliorer car ça ne fonction pas très bien pour les X = 0 1 2 3 4...
    this.d3Scale.nice();
    return this;
  }
}

export class FlChartAxisScaleBand extends FlChartAxisScale<Numeric> {
  public readonly d3Scale: ScaleBand<Numeric>;

  constructor() {
    super();
  }

  protected initScale(): ScaleBand<Numeric> {
    const band: ScaleBand<Numeric> = d3.scaleBand();
    band.padding(0.1);
    return band;
  }

  public bandwidth(): number {
    return this.d3Scale.bandwidth();
  }

  public zoom(from: number, to: number): void {
    const fromDomain: number = this.invertPos(from);
    const toDomain: number = this.invertPos(to);

    this.domain(this.getDomain().slice(fromDomain, toDomain + 1));
  }

  private invertPos(rangeValue: number): number {
    return Math.trunc(rangeValue / this.bandwidth());
  }

  // do nothing on band, because the domain is already good
  nice(): this {
    return this;
  }




}
