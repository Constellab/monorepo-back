import {NumberValue} from 'd3-scale';
import * as d3 from 'd3';
import {AxisScale, Numeric} from 'd3';


export interface FlD3AxisScale<Value extends Numeric> extends AxisScale<Value> {
  (value: Value): number;

  invert(rangeValue: NumberValue): Value;

  range(): number[];

  range(range: Iterable<number>): this;

  domain(): Value[];

  domain(domain: Iterable<Value>): this;

  copy(): this;

  bandwidth?(): number;

  ticks(count: number): Value[];

}


export abstract class FlChartAxisScale<Value extends Numeric> {

  public readonly d3Scale: FlD3AxisScale<Value>;

  protected constructor() {
    this.d3Scale = this.initScale();
  }

  protected abstract initScale(): FlD3AxisScale<Value>;

  public scale(value: Value): number {
    return this.d3Scale(value);
  }

  public invert(rangeValue: number): Value {
    return this.d3Scale.invert(rangeValue);
  }


  public range(range: Iterable<number>): this {
    this.d3Scale.range(range);
    return this;
  }

  public domain(domain: Value[]): this {
    this.d3Scale.domain(domain);
    return this;
  }


  public simpleDomain(from: Value, to: Value): this {
    return this.domain([from, to]);
  }

  /////////////////////// GET METHODS ///////////////////////

  public ticks(count: number): Value[] {
    return this.d3Scale.ticks(count);
  }

  public getDomain(): Value[] {
    return this.d3Scale.domain();
  }
}

export class FlChartAxisScaleDate extends FlChartAxisScale<Numeric> {

  constructor() {
    super();
  }

  protected initScale(): FlD3AxisScale<Numeric> {
    return d3.scaleTime();
  }
}

export class FlChartAxisScaleNumber extends FlChartAxisScale<Numeric> {

  constructor() {
    super();
  }

  protected initScale(): FlD3AxisScale<Numeric> {
    return d3.scaleLinear();
  }
}
