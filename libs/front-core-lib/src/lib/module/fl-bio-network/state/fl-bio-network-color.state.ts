import {Injectable} from '@angular/core';
import {FlBioNetworkGroupState} from './fl-bio-network-group.state';
import {FlBioNetworkClusterSelection, FlBioNetworkMetaboliteLevel} from '../model/fl-bio-network.class';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlBioNetworkD3Node, flBioNetworkNodeClass} from '../model/fl-bio-network-d3-node.class';
import {FlBioNetworkD3Object} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkD3Link, flBioNetworkLinkElement} from '../model/fl-bio-network-d3-link.class';
import {ScaleLinear} from 'd3-scale';
import {quantile, scaleLinear} from 'd3';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {FlBioNetworkState} from './fl-bio-network.state';
import {
  FlBioNetworkLinkColorScale,
  FlBioNetworkOptions,
  FlBioNetworkOptionsState
} from './fl-bio-network-options.state';
import {filter} from 'rxjs/operators';
import {ClNumberHelper} from '@monorepo/core-lib';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';

type FlColorFunction = (node: FlBioNetworkD3Object) => string;
type FlLinkColorFunction = (node: FlBioNetworkD3Link) => string;

/**
 * State for the color of the nodes and links of the network
 */
@Injectable()
export class FlBioNetworkColorState {

  private readonly grey: string;


  constructor(private groupState: FlBioNetworkGroupState,
              private state: FlBioNetworkState,
              private optionState: FlBioNetworkOptionsState,
              themeService: FlThemeService) {
    const themeDetail: FlThemeDetail = themeService.getCurrentThemeDetail();
    this.grey = themeDetail.greyHighContrast;

    this.optionState.getOptions$().pipe(
      // refresh the color when color options changed or visibility changed
      filter(options => options.action === 'updateVisibilityLevel' || options.action === 'color' || options.action === 'init')
    ).subscribe(
      event => this.onOptionEvent(event)
    );
  }

  /**
   * Method call when the link color changed
   * @private
   */
  private onOptionEvent(options: FlBioNetworkOptions): void {
    if (!this.isReady()) return;

    if (options.coloredClusters?.length > 0) {
      this.colorClusters(options.visibleLevels, options.coloredClusters);
    } else {
      this.changeLinkColor(options.visibleLevels, this.getLinkColorFunction(options.linkColorScale));
      this.changeNodeColor(options.visibleLevels, this.getNodeColorFunction());
    }
  }


  private colorClusters(nodeLevels: FlBioNetworkMetaboliteLevel[], clusters: FlBioNetworkClusterSelection[]): void {
    if (!this.isReady()) return;

    const colorFunction = this.getClusterColorFunction(clusters);
    this.changeNodeColor(nodeLevels, colorFunction);
    this.changeLinkColor(nodeLevels, colorFunction);
  }

  private getClusterColorFunction(clusters: FlBioNetworkClusterSelection[]): FlColorFunction {
    return (node: FlBioNetworkD3Object) => {
      for (const cluster of clusters) {
        if (node.isInCluster(cluster.name)) {
          return cluster.color;
        }
      }
      return node.defaultColor;
    };
  }


  /////////////////////////////// NODE  COLOR ///////////////////////////////

  private changeNodeColor(nodeLevels: FlBioNetworkMetaboliteLevel[], colorFunction: FlColorFunction): void {
    const nodeSelection = this.getNodeSelection(nodeLevels);
    nodeSelection.style('fill', d => colorFunction(d));
  }

  private getNodeColorFunction(): FlColorFunction {
    return (node: FlBioNetworkD3Object) => node.defaultColor;
  }

  // get the selection of the nodes objects (not container)
  private getNodeSelection(nodeLevels: FlBioNetworkMetaboliteLevel[]): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return this.groupState.getNodesGroup(nodeLevels).selectAll(`.${flBioNetworkNodeClass}`);
  }

  /////////////////////////////// LINK COLOR ///////////////////////////////

  private changeLinkColor(nodeLevels: FlBioNetworkMetaboliteLevel[], colorFunction: FlLinkColorFunction): void {
    const linkSelection = this.getLinkSelection(nodeLevels);
    linkSelection.style('stroke', d => colorFunction(d));
  }

  private getLinkColorFunction(linkColorScale: FlBioNetworkLinkColorScale): FlLinkColorFunction {
    const colorTransform: (value: number) => number = this.getLinkColorTransformFunction(linkColorScale);
    const colorScale = this.getLinkColorScale(linkColorScale);
    return (link: FlBioNetworkD3Link) => colorScale(colorTransform(link.absValue));
  }

  // create a color scale for link
  private getLinkColorScale(colorMode: FlBioNetworkLinkColorScale): ScaleLinear<string, any, any> {
    const range: [string, string] = [this.grey, FlColorHelper.pinkShiny];

    const max = this.getLinkColorMaxDomain(colorMode);
    return scaleLinear<string>().domain(
      [0, max])
      .range(range)
      .clamp(true); // value outside domain are clamped to the edges
  }

  /**
   * Return the link color max domain based on mode
   * @param colorMode
   * @private
   */
  private getLinkColorMaxDomain(colorMode: FlBioNetworkLinkColorScale): number {

    if (colorMode === 'threshold-75' || colorMode === 'threshold-95') {
      const threshold = colorMode === 'threshold-75' ? 0.75 : 0.95;

      // round all value to merge similar values
      const values = this.state.getCurrentChartData().getLinksValues().map(value => ClNumberHelper.round(value, 1));
      // remove duplicates
      const uniqueValues = new Set(values);

      // return the quantile
      return quantile(uniqueValues, threshold);
    }

    // for other color modes, return the max value
    const func = this.getLinkColorTransformFunction(colorMode);
    return func(this.state.getCurrentChartData().getLinksMaxAbsoluteValue());
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

  // get the selection of the nodes objects (not container)
  private getLinkSelection(nodeLevels: FlBioNetworkMetaboliteLevel[]): FlD3SelectionSimple<FlBioNetworkD3Link> {
    return this.groupState.getLinksGroup(nodeLevels).selectAll(flBioNetworkLinkElement);
  }

  /////////////////////////////// OTHER ///////////////////////////////

  private isReady(): boolean {
    return this.groupState.isReady();
  }
}
