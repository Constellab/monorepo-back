import * as d3 from 'd3';
import {scaleLinear, ScaleOrdinal} from 'd3';
import {FlChartScale} from './fl-chart-scale.class';
import {ScaleLinear} from 'd3-scale';

/**
 * Specific scale to return a color based on a value
 */
export interface FlChartScaleColor extends FlChartScale {

  /**
   * return a color base on a value
   * @param value
   */
  scale(value: number): string;
}

/**
 * Color scale contains a list of colors and return one color based on domain
 */
export class FlChartScaleColorMulti implements FlChartScaleColor {

  public readonly d3Scale: ScaleOrdinal<string, string>;

  constructor(domain: number[]) {
    this.d3Scale = this.initScale();
    this.d3Scale.domain(domain.map(d => d.toString()));
  }

  private initScale(): ScaleOrdinal<string, string> {
    // the range contains all available colors
    return d3.scaleOrdinal<string>(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3',
      '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999']);
  }

  public scale(value: number): string {
    return this.d3Scale(value.toString());
  }
}

/**
 * Color scale to make a gradient color scale
 */
export class FlChartScaleColorLinear implements FlChartScaleColor {

  public readonly d3Scale: ScaleLinear<string, string>;

  constructor(domain: number[]) {
    this.d3Scale = this.initScale();
    this.d3Scale.domain(domain);
  }

  private initScale(): ScaleLinear<string, string> {
    // the range contains all available colors
    return scaleLinear<string>()
      .range(['white', '#69b3a2']);
  }

  public scale(value: number): string {
    if (value == null) return '';
    return this.d3Scale(value);
  }
}


/**
 * Color scale that return only one color
 */
export class FlChartScaleColorSimple implements FlChartScaleColor {

  constructor(private color: string) {
  }

  public scale(): string {
    return this.color;
  }
}
