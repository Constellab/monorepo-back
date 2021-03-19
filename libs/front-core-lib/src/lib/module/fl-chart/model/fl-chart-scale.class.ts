import {NumberValue, ScaleBand} from 'd3-scale';
import * as d3 from 'd3';
import {AxisScale, Numeric} from 'd3';

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
}


export abstract class FlChartAxisScale<Value> {

  public readonly d3Scale: FlD3AxisScale<Value>;

  protected constructor() {
    this.d3Scale = this.initScale();
  }

  protected abstract initScale(): FlD3AxisScale<Value>;

  public scale(value: Value): number {
    return this.d3Scale(value);
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

  public getDomain(): Value[] {
    return this.d3Scale.domain();
  }
}

// todo est-ce qu'on garde le generic ?
export abstract class FlChartAxisScaleLinear<Value extends Numeric> extends FlChartAxisScale<Value> {
  public readonly d3Scale: FlD3AxisScaleLinear<Value>;

  protected abstract initScale(): FlD3AxisScaleLinear<Value>;

  public invert(rangeValue: number): Value {
    return this.d3Scale.invert(rangeValue);
  }

  public ticks(count: number): Value[] {
    return this.d3Scale.ticks(count);
  }
}


export class FlChartAxisScaleDate extends FlChartAxisScaleLinear<Numeric> {

  constructor() {
    super();
  }

  protected initScale(): FlD3AxisScaleLinear<Date> {
    return d3.scaleTime();
  }
}

export class FlChartAxisScaleNumber extends FlChartAxisScaleLinear<Numeric> {

  constructor() {
    super();
  }

  protected initScale(): FlD3AxisScaleLinear<Numeric> {
    return d3.scaleLinear();
  }
}

export class FlChartAxisScaleBand extends FlChartAxisScale<Numeric> {
  public readonly d3Scale: ScaleBand<Numeric>;

  constructor() {
    super();
  }

  protected initScale(): ScaleBand<Numeric> {
    return d3.scaleBand();
  }

  public bandwidth(): number {
    return this.d3Scale.bandwidth();
  }


}
