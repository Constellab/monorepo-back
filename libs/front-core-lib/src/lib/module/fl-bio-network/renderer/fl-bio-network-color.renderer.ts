import {Injectable} from '@angular/core';
import {FlBioNetworkGraphRenderer, FlBioNetworkMainTwoRenderer} from './fl-bio-network-main-two.renderer';
import {FlBioNetworkOptions, FlBioNetworkOptionsState} from '../state/fl-bio-network-options.state';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {filter} from 'rxjs/operators';
import {FlBioNetworkClusterSelection} from '../model/fl-bio-network.class';
import {FlBioNetworkD3Object} from '../model/fl-bio-network-d3.class';
import {ForceGraphInstance} from 'force-graph';
import {combineLatest} from 'rxjs';
import {FlBioNetworkNodesRenderer} from './fl-bio-network-nodes.renderer';
import {FlBioNetworkLinksRenderer} from './fl-bio-network-links.renderer';

type FlColorFunction = (node: FlBioNetworkD3Object) => string;

@Injectable()
export class FlBioNetworkColorRenderer {

  private readonly greyLowContrast: string;

  constructor(private optionState: FlBioNetworkOptionsState,
              private mainRenderer: FlBioNetworkMainTwoRenderer,
              private nodesRenderer: FlBioNetworkNodesRenderer,
              private linksRenderer: FlBioNetworkLinksRenderer,
              themeService: FlThemeService) {
    const themeDetail: FlThemeDetail = themeService.getCurrentThemeDetail();
    this.greyLowContrast = themeDetail.greyLowContrast;
  }

  public init(): void {
    const options$ = this.optionState.getOptions$().pipe(
      // refresh the color when color options changed or visibility changed
      filter(options => options.action === 'color' || options.action === 'init')
    );

    combineLatest([this.mainRenderer.getGraphRenderer$(), options$]).subscribe(
      ([graph, options]) => this.onOptionEvent(graph, options));
  }


  /**
   * Method call when the link color changed
   * @private
   */
  private onOptionEvent(graphRenderer: FlBioNetworkGraphRenderer, options: FlBioNetworkOptions): void {

    if (options.coloredClusters?.length > 0) {
      this.colorClusters(graphRenderer.graph, options.coloredClusters);
    } else {
      this.linksRenderer.setColorScaleFunction(graphRenderer, options.linkColorScale);
      this.nodesRenderer.setDefaultColor(graphRenderer.graph);
    }
  }

  private colorClusters(graph: ForceGraphInstance, clusters: FlBioNetworkClusterSelection[]): void {

    const colorFunction = this.getClusterColorFunction(clusters);

    // color nodes
    this.nodesRenderer.setColorFunction(graph, colorFunction);

    // color links
    this.linksRenderer.setColorFunction(graph, colorFunction);
  }

  private getClusterColorFunction(clusters: FlBioNetworkClusterSelection[]): FlColorFunction {
    return (node: FlBioNetworkD3Object) => {
      for (const cluster of clusters) {
        if (node.isInCluster(cluster.name)) {
          return cluster.color;
        }
      }
      return this.greyLowContrast;
    };
  }

}
