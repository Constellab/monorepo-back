import {scaleLinear, scaleOrdinal, ScaleOrdinal} from 'd3';
import {FlChartScaleI} from './fl-chart-scale.class';
import {ScaleLinear} from 'd3-scale';
import {FlColorHelper} from '../../../../utils/fl-color-helper.class';
import {FlChartMultiSerie} from '../data/fl-chart-multi-serie.class';
import {FlTagWithColor} from '../../../fl-tag/fl-tag.class';

/**
 * Specific scale to return a color based on a value
 */
export interface FlChartScaleColor extends FlChartScaleI {

  /**
   * return a color base on a value
   * @param value
   */
  getColor(value: any): string;
}

/**
 * Color scale contains a list of colors and return one color based on domain
 */
export class FlChartScaleColorMulti implements FlChartScaleColor {

  public readonly d3Scale: ScaleOrdinal<string, string>;

  constructor(domain: (number | string)[], private transparentColor: boolean = false) {
    this.d3Scale = this.initScale();
    this.d3Scale.domain(domain.map(d => d.toString()));
  }

  // create a color scale from a multiple series. Each series key is linked to a color
  public static fromMultiSeries(dataContainer: FlChartMultiSerie<any>, transparentColor: boolean = false): FlChartScaleColorMulti {
    return new FlChartScaleColorMulti(dataContainer.series.map(d => d.key), transparentColor);
  }

  private initScale(): ScaleOrdinal<string, string> {
    const colors = this.transparentColor ? FlColorHelper.getColorTransparentList() : FlColorHelper.getColorList();
    // the range contains all available colors
    return scaleOrdinal<string>(colors);
  }

  public getColor(value: number | string): string {
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

  public getColor(value: number): string {
    if (value == null) return 'white';
    return this.d3Scale(value);
  }
}

/**
 * Color scale contains a list of colors and return one color based on domain
 */
export class FlChartScaleColorTag implements FlChartScaleColor {

  public readonly d3Scale: ScaleOrdinal<string, string>;

  constructor(private tagsColors: FlTagWithColor[]) {
  }


  public getColor(tags: Record<string, string>): string {
    if (tags == null) return 'black';

    for (const key of Object.keys(tags)) {
      const tag = this.tagsColors.find(tag => tag.key === key && tag.value === tags[key]);
      // if the key value has a color, return it
      if (tag) {
        return tag.color;
      }
    }
    return 'black';
  }
}


/**
 * Color scale that return only one color
 */
export class FlChartScaleColorSimple implements FlChartScaleColor {

  constructor(private color: string) {
  }

  public getColor(): string {
    return this.color;
  }
}
