import {Injectable} from '@angular/core';
import {FlBioNetworkGroupState} from './fl-bio-network-group.state';
import {FlBioNetworkMetaboliteLevel, FlBioNetworkPathwaySelection} from '../model/fl-bio-network.class';
import {FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlBioNetworkD3Node, flBioNetworkNodeClass} from '../model/fl-bio-network-d3-node.class';
import {FlBioNetworkD3Object} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkD3Link, flBioNetworkLinkElement} from '../model/fl-bio-network-d3-link.class';
import {ScaleLinear} from 'd3-scale';
import {scaleLinear} from 'd3';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {FlBioNetworkState} from './fl-bio-network.state';
import {
  FlBioNetworkLinkColorScale,
  FlBioNetworkOptions,
  FlBioNetworkOptionsState
} from './fl-bio-network-options.state';
import {filter} from 'rxjs/operators';

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

    if (options.coloredPathways?.length > 0) {
      this.colorPathways(options.visibleLevels, options.coloredPathways);
    } else {
      this.changeLinkColor(options.visibleLevels, this.getLinkColorFunction(options.linkColorScale));
      this.changeNodeColor(options.visibleLevels, this.getNodeColorFunction());
    }
  }


  private colorPathways(nodeLevels: FlBioNetworkMetaboliteLevel[], pathways: FlBioNetworkPathwaySelection[]): void {
    if (!this.isReady()) return;

    const colorFunction = this.getPathwayColorFunction(pathways);
    this.changeNodeColor(nodeLevels, colorFunction);
    this.changeLinkColor(nodeLevels, colorFunction);
  }

  private getPathwayColorFunction(pathways: FlBioNetworkPathwaySelection[]): FlColorFunction {
    return (node: FlBioNetworkD3Object) => {
      for (const pathway of pathways) {
        if (node.isInPathway(pathway.id)) {
          return pathway.color;
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
    const colorScale = this.getLinkColorScale(colorTransform);
    return (link: FlBioNetworkD3Link) => colorScale(colorTransform(link.absValue));
  }

  // create a color scale for link
  private getLinkColorScale(colorTransform: (value: number) => number): ScaleLinear<string, any, any> {

    const range: [string, string] = [this.grey, 'blue'];

    const max = this.state.getCurrentChartData().getLinksMaxAbsoluteValue();

    return scaleLinear<string>().domain(
      [0, colorTransform(max)])
      .range(range);
  }

  // return a function to apply on link value before calling the color scale
  private getLinkColorTransformFunction(colorMode: FlBioNetworkLinkColorScale): (absValue: number) => number {
    if (colorMode === 'logarithm') {
      return (absValue => {
        // get the log 2 of absolute value
        return Math.log2(absValue + 1);
      });
    } else {
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
