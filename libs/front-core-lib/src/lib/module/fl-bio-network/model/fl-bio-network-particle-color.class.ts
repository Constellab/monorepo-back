import {FlBioNetworkParticleColorScale} from '../state/fl-bio-network-options.state';
import {ClNumberHelper} from '@monorepo/core-lib';
import {quantile, scaleLinear} from 'd3';
import {FlBioNetworkLink} from './fl-bio-network-node-link.class';
import {ScaleLinear} from 'd3-scale';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';

export type FlBioNetworkLinkColorFunction = (node: FlBioNetworkLink) => string;

/**
 * Class to manage the color of the link particles based on options
 */
export class FlBioNetworkParticleColor {


  constructor(private colorMode: FlBioNetworkParticleColorScale,
              private allLinkValues: number[],
              private greyColor: string) {

  }

  public getColor(link: FlBioNetworkLink): string {
    return this.getColorScaleFunction()(link);
  }

  public getColorScaleFunction(): FlBioNetworkLinkColorFunction {
    const colorTransform: (value: number) => number = this.getColorTransformFunction();
    const colorScale = this.getColorScale();
    return (link: FlBioNetworkLink) => colorScale(colorTransform(link.absValue));
  }

  // create a color scale for link
  private getColorScale(): ScaleLinear<string, any, any> {
    const range: [string, string] = [this.greyColor, FlColorHelper.pinkShiny];

    let max = this.getColorMaxDomain(this.colorMode);
    if (max === 0) {
      max = 1;
    }
    return scaleLinear<string>().domain(
      [0, max])
      .range(range)
      .clamp(true); // value outside domain are clamped to the edges
  }

  /**
   * Return the link color max domain based on mode
   */
  private getColorMaxDomain(colorMode: FlBioNetworkParticleColorScale): number {

    if (colorMode === 'threshold-75' || colorMode === 'threshold-95') {
      return this.getQuantile(colorMode === 'threshold-75' ? 0.75 : 0.95);
    }

    // for other color modes, return the max value
    const func = this.getColorTransformFunction();
    return func(this.getMaxValue());
  }


  // return a function to apply on link value before calling the color scale
  private getColorTransformFunction(): (absValue: number) => number {
    return (absValue => this.transformValue(absValue));
  }

  public transformValue(absValue: number): number {
    switch (this.colorMode) {
      case 'log2':
        return Math.log2(absValue + 1);
      case 'log10':
        return Math.log10(absValue + 1);
      default:
        return absValue;
    }
  }

  public getQuantile(threshold: number): number {
    // round all value to merge similar values
    const values = this.allLinkValues.map(value => ClNumberHelper.round(value, 1));
    // remove duplicates
    const uniqueValues = new Set(values);

    // return the quantile
    return quantile(uniqueValues, threshold);
  }

  private getMaxValue(): number {
    return Math.max(...this.allLinkValues);
  }
}
