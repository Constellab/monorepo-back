import {scaleLinear} from 'd3';
import {FlChartScaleI} from './fl-chart-scale.class';
import {ScaleLinear} from 'd3-scale';
import {FlColorHelper} from '../../../../utils/fl-color-helper.class';
import {FlChartMultiSerie} from '../data/fl-chart-multi-serie.class';
import {FlChartDataWithSerie} from '../data/fl-chart-serie.class';


export type FlChartColorFunction<T = any> = (d: T) => string;
export const flChartTransparentColorOpacity = 0.8;

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


  private keyColor: Record<string, string>;

  constructor(domain: (number | string)[], transparentColor: boolean = false) {
    this.initScale(domain, transparentColor);
  }

  // create a color scale from a multiple series. Each series key is linked to a color
  public static fromMultiSeries(dataContainer: FlChartMultiSerie<any>, transparentColor: boolean = false): FlChartScaleColorMulti {
    return new FlChartScaleColorMulti(dataContainer.series.map(d => d.key), transparentColor);
  }

  private initScale(domain: (number | string)[], transparentColor: boolean): void {
    const transparency: number = transparentColor ? 0.8 : 1;
    const colors = FlColorHelper.getColorList(transparency);

    const keyColors: Record<string, string> = {};
    for (let i = 0; i < domain.length; i++) {
      keyColors[domain[i].toString()] = colors[i % colors.length];
    }

    this.keyColor = keyColors;
  }

  public scale(value: number | string): string {
    return this.keyColor[value.toString()];
  }

  /**
   * Get the function to get the color from a FlChartDataWithSerie
   */
  public exportToColorSeriesFunction(): FlChartColorFunction<FlChartDataWithSerie<any>> {
    return (d: FlChartDataWithSerie<any>) => this.scale(d.serieKey);
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
