import {scaleLinear, scaleOrdinal, ScaleOrdinal} from 'd3';
import {FlChartScaleI} from './fl-chart-scale.class';
import {ScaleLinear} from 'd3-scale';
import {FlColorHelper} from '../../../../utils/fl-color-helper.class';
import {FlChartMultiSerie} from '../data/fl-chart-multi-serie.class';

/**
 * Specific scale to return a color based on a value
 */
export interface FlChartScaleColor extends FlChartScaleI {

  /**
   * return a color base on a value
   * @param value
   */
  scale(value: any): string;
}

/**
 * Color scale contains a list of colors and return one color based on domain
 */
export class FlChartScaleColorMulti implements FlChartScaleColor {

  public readonly d3Scale: ScaleOrdinal<string, string>;

  constructor(domain: (number | string)[]) {
    this.d3Scale = this.initScale();
    this.d3Scale.domain(domain.map(d => d.toString()));
  }

  // create a color scale from a multiple series. Each series key is linked to a color
  public static fromMultiSeries(dataContainer: FlChartMultiSerie<any>): FlChartScaleColorMulti{
    return new FlChartScaleColorMulti(dataContainer.series.map(d => d.key));
  }

  private initScale(): ScaleOrdinal<string, string> {
    // the range contains all available colors
    return scaleOrdinal<string>(FlColorHelper.getColorList());
  }

  public scale(value: number | string): string {
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
    if (value == null) return 'white';
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
