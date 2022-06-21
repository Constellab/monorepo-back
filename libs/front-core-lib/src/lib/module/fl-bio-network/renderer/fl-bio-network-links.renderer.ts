import {Injectable} from '@angular/core';
import {ForceGraphInstance} from 'force-graph';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';
import {FlBioNetworkMetaboliteLevel} from '../model/fl-bio-network.class';
import {FlBioNetworkLinkColorScale} from '../state/fl-bio-network-options.state';
import {ScaleLinear} from 'd3-scale';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';
import {quantile, scaleLinear} from 'd3';
import {ClNumberHelper} from '@monorepo/core-lib';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlBioNetworkGraphRenderer} from './fl-bio-network-main-two.renderer';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';

type FlLinkColorFunction = (node: FlBioNetworkD3Link) => string;


@Injectable()
export class FlBioNetworkLinksRenderer {

  private readonly greyLowContrast: string;


  constructor(themeService: FlThemeService) {
    const themeDetail: FlThemeDetail = themeService.getCurrentThemeDetail();
    this.greyLowContrast = themeDetail.greyLowContrast;
  }

  public render(graph: ForceGraphInstance): void {
    graph
      // size based on link weight, set to 1 when the link is not selected
      .linkWidth((link: FlBioNetworkD3Link) =>
        link.selected ? this.getLinkWidth(link) : 1)
      .linkDirectionalArrowLength((link: FlBioNetworkD3Link) => link.isLinkedToCofactor() ? 3 : 10)
      .linkDirectionalArrowRelPos(0.5);
  }

  private getLinkWidth(link: FlBioNetworkD3Link): number {
    const level = link.getLevel();
    switch (level) {
      case FlBioNetworkMetaboliteLevel.MAJOR:
        return link.absLog10Value + 3;
      case FlBioNetworkMetaboliteLevel.MINOR:
        return link.absLog10Value + 1;
      case FlBioNetworkMetaboliteLevel.COFACTOR:
        return Math.max(link.absLog10Value, 1);
    }
  }

  public setColorFunction(graph: ForceGraphInstance, colorFunction: FlLinkColorFunction): void {
    graph.linkColor((link: FlBioNetworkD3Link) => {
      // if the link is not selected, always return grey
      if (!link.selected) return this.greyLowContrast;
      return colorFunction(link);
    });
  }

  public setColorScaleFunction(graphRenderer: FlBioNetworkGraphRenderer, colorMode: FlBioNetworkLinkColorScale): void {
    const colorFunction = this.getLinkColorScaleFunction(graphRenderer.data, colorMode);
    this.setColorFunction(graphRenderer.graph, colorFunction);
  }


  private getLinkColorScaleFunction(data: FlBioNetworkD3, linkColorScale: FlBioNetworkLinkColorScale): FlLinkColorFunction {
    const colorTransform: (value: number) => number = this.getLinkColorTransformFunction(linkColorScale);
    const colorScale = this.getLinkColorScale(data, linkColorScale);
    return (link: FlBioNetworkD3Link) => colorScale(colorTransform(link.absValue));
  }

  // create a color scale for link
  private getLinkColorScale(data: FlBioNetworkD3, colorMode: FlBioNetworkLinkColorScale): ScaleLinear<string, any, any> {
    const range: [string, string] = [this.greyLowContrast, FlColorHelper.pinkShiny];

    const max = this.getLinkColorMaxDomain(data, colorMode);
    return scaleLinear<string>().domain(
      [0, max])
      .range(range)
      .clamp(true); // value outside domain are clamped to the edges
  }

  /**
   * Return the link color max domain based on mode
   */
  private getLinkColorMaxDomain(data: FlBioNetworkD3, colorMode: FlBioNetworkLinkColorScale): number {

    if (colorMode === 'threshold-75' || colorMode === 'threshold-95') {
      const threshold = colorMode === 'threshold-75' ? 0.75 : 0.95;

      // round all value to merge similar values
      const values = data.getLinksValues().map(value => ClNumberHelper.round(value, 1));
      // remove duplicates
      const uniqueValues = new Set(values);

      // return the quantile
      return quantile(uniqueValues, threshold);
    }

    // for other color modes, return the max value
    const func = this.getLinkColorTransformFunction(colorMode);
    return func(data.getLinksMaxAbsoluteValue());
  }


  // return a function to apply on link value before calling the color scale
  private getLinkColorTransformFunction(colorMode: FlBioNetworkLinkColorScale): (absValue: number) => number {
    switch (colorMode) {
      case 'log2':
        return (absValue => Math.log2(absValue + 1));
      case 'log10':
        return (absValue => Math.log10(absValue + 1));
      default:
        return (absValue => absValue);
    }
  }
}
