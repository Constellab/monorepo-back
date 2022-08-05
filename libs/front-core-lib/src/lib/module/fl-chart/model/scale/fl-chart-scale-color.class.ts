import {scaleLinear, scaleOrdinal, ScaleOrdinal} from 'd3';
import {FlChartScaleI} from './fl-chart-scale.class';
import {ScaleLinear} from 'd3-scale';
import {FlColorHelper} from '../../../../utils/fl-color-helper.class';
import {FlChartMultiSerie} from '../data/fl-chart-multi-serie.class';
import {FlChartDataWithSerie} from '../data/fl-chart-serie.class';


export type FlChartColorFunction<T = any> = (d: T) => string;
export const flChartTransparentColorOpacity = 0.8;

export function flChartGetColorMultiSerieFunction(dataContainer: FlChartMultiSerie<any>,
                                                  transparentColor: boolean = false): FlChartColorFunction<FlChartDataWithSerie<any>> {
  const keys = dataContainer.series.map(d => d.key);
  const transparency: number = transparentColor ? 0.8 : 1;
  const colors = FlColorHelper.getColorList(transparency);

  const keyColors: Record<string, string> = {};
  for (let i = 0; i < keys.length; i++) {
    keyColors[keys[i]] = colors[i % colors.length];
  }

  return (d: FlChartDataWithSerie<any>) => {
    return keyColors[d.serieKey];
  };
}

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

  private readonly d3Scale: ScaleOrdinal<string, string>;

  constructor(domain: (number | string)[], private transparentColor: boolean = false) {
    this.d3Scale = this.initScale();
    this.d3Scale.domain(domain.map(d => d.toString()));
  }

  // create a color scale from a multiple series. Each series key is linked to a color
  public static fromMultiSeries(dataContainer: FlChartMultiSerie<any>, transparentColor: boolean = false): FlChartScaleColorMulti {
    return new FlChartScaleColorMulti(dataContainer.series.map(d => d.key), transparentColor);
  }

  private initScale(): ScaleOrdinal<string, string> {
    const transparency: number = this.transparentColor ? flChartTransparentColorOpacity : 1;
    const colors = FlColorHelper.getColorList(transparency);
    // the range contains all available colors
    return scaleOrdinal<string>(colors);
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

  /**
   *
   * @param domain domain of the values
   * @param fromColor color for lowest value
   * @param toColor color for highest value
   */
  constructor(domain: number[], private fromColor: string = FlColorHelper.blue, private toColor: string = FlColorHelper.red) {
    this.d3Scale = this.initScale();
    this.d3Scale.domain(domain);
  }

  private initScale(): ScaleLinear<string, string> {
    // the range contains all available colors
    return scaleLinear<string>()
      .range([this.fromColor, this.toColor]);
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
