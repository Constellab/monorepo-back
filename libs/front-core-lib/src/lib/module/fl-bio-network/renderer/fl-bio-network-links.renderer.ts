import {FlBioNetworkLink} from '../model/fl-bio-network-node-link.class';
import {FlBioNetworkMetaboliteLevel} from '../model/fl-bio-network.class';
import {FlBioNetworkOptions} from '../state/fl-bio-network-options.state';
import {FlBioNetworkGraphRenderer} from './fl-bio-network-main.renderer';
import {FlBioNetworkObjectColorFunction, FlBioNetworkObjectRenderer} from './fl-bio-network-object.renderer';
import {Observable} from 'rxjs';
import {FlBioNetworkSelectionEvent} from '../model/fl-bio-network-selection.class';
import {FlBioNetworkNodeCofactor} from '../model/fl-bio-network-node-cofactor.class';
import {FlBioNetworkLinkColorFunction, FlBioNetworkParticleColor} from '../model/fl-bio-network-particle-color.class';
import {FlBioNetworkNode} from '../model/fl-bio-network-node.class';


export class FlBioNetworkLinksRenderer extends FlBioNetworkObjectRenderer {

  constructor(graphRenderer: FlBioNetworkGraphRenderer,
              options$: Observable<FlBioNetworkOptions>,
              selection$: Observable<FlBioNetworkSelectionEvent>,
              greyColor: string) {
    super(graphRenderer, options$, selection$, greyColor);
  }

  public render(): void {
    this.graphRenderer.graph;
  }

  protected updateObjectColors(options: FlBioNetworkOptions): void {
    let colorFunc: FlBioNetworkObjectColorFunction;
    if (options.coloredClusters?.length > 0) {
      colorFunc = this.getClusterColorFunction(options.coloredClusters);
    } else {
      colorFunc = null;
    }

    this.setColorFunction(colorFunc);
    const linkColor = new FlBioNetworkParticleColor(options.particleColorScale,
      this.graphRenderer.data.getLinksValues(), this.greyColor);

    // link arrow visibility
    if (options.showArrows) {
      this.graphRenderer.graph.linkDirectionalArrowLength(
        (link: FlBioNetworkLink) => link.isLinkedToCofactor() ? 3 : 10)
        .linkDirectionalArrowRelPos(0.5);
    } else {
      this.graphRenderer.graph.linkDirectionalArrowLength(null);
    }


    // link directional particles
    if (options.showParticles) {
      // particle width from param
      this.graphRenderer.graph.linkDirectionalParticleWidth(options.particleSize);

      // color of the particles based on link value
      this.graphRenderer.graph.linkDirectionalParticleColor(
        (link: FlBioNetworkLink) => {
          // if the link is not selected, always return grey
          if (!link.selected) return this.greyColor;
          return linkColor.getColor(link);
        });

      // get the transformed media of the link values
      const quantile = linkColor.transformValue(linkColor.getQuantile(0.5));

      // nb of particules in a link based on the link value and the length of the link
      this.graphRenderer.graph.linkDirectionalParticles(
        (link: FlBioNetworkLink) => {

          const linkValue = linkColor.transformValue(link.absValue);

          // threshold function to limit density of particles based on link value
          const density = (options.particleDensityThreshold * linkValue) / (quantile + linkValue);

          // have the total number of particle by multiplying by the particle density by the length of the link
          return Math.round(link.getLength() * density);
          // return Math.round((link.absValue * link.getLength()) / (maxValue * 10));
        }
      );

      // speed of the particles based on the link value
      // the speed of the lib is the time the particles take to travel through the link (whatever the length of the link)
      // So we use the link in the calculation to have a speed of the particles that does not depend on the link length
      this.graphRenderer.graph.linkDirectionalParticleSpeed(
        (link: FlBioNetworkLink) => {
          const linkValue = linkColor.transformValue(link.absValue);
          // calculate the speed of the particles based on link length
          // the 5 is used to speed up all the particles
          const speed = (linkValue / link.getLength()) * 5;
          // threshold function to have value between 0 and 0.1
          return (options.particleSpeedThreshold * speed) / (quantile + speed);
        });
    } else {
      // disable the particles
      this.graphRenderer.graph.linkDirectionalParticles(0);
    }

    this.graphRenderer.graph.linkLineDash((link: FlBioNetworkLink) =>
      link.type === 'cross-cluster-link' ? [5, 2] : null);
  }

  protected updateVisibility(visibleLevels: FlBioNetworkMetaboliteLevel[],
                             selectedNode: FlBioNetworkNode | null,
                             showRelatedCofactor: boolean): void {
    const levelVisibility = this.getLevelVisibilityFunction(visibleLevels);

    let visibilityLink: (object: FlBioNetworkLink) => boolean;

    if (showRelatedCofactor) {
      // show all links and links to cofactors if the cofactor parent reaction is selected
      visibilityLink = (link: FlBioNetworkLink) => {
        if (link.source instanceof FlBioNetworkNodeCofactor) {
          return link.source.showCofactor(visibleLevels);
        } else if (link.target instanceof FlBioNetworkNodeCofactor) {
          return link.target.showCofactor(visibleLevels);
          // only show the cross cluster link for the selected node
        } else if (selectedNode && link.type === 'cross-cluster-link') {
          return link.target.id === selectedNode.id || link.source.id === selectedNode.id;
        }
        return link.isVisible && link.type === 'link' && levelVisibility(link);
      };
    } else {
      // only show the visible links of basic type
      visibilityLink = (object: FlBioNetworkLink) => object.isVisible && object.type === 'link' && levelVisibility(object);
    }

    this.graphRenderer.graph.linkVisibility(visibilityLink);
  }

  private setColorFunction(colorFunction: FlBioNetworkLinkColorFunction): void {
    this.graphRenderer.graph.linkColor((link: FlBioNetworkLink) => {
      // if the link is not selected, always return grey
      if (!link.selected || colorFunction == null) return this.greyColor;
      return colorFunction(link);
    });
  }
}
