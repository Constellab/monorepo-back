import {FlBioNetworkLink} from '../model/fl-bio-network-node-link.class';
import {FlBioNetworkMetaboliteLevel} from '../model/fl-bio-network.class';
import {FlBioNetworkLinkColorScale, FlBioNetworkOptions} from '../state/fl-bio-network-options.state';
import {ScaleLinear} from 'd3-scale';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';
import {quantile, scaleLinear} from 'd3';
import {ClNumberHelper} from '@monorepo/core-lib';
import {FlBioNetworkGraphRenderer} from './fl-bio-network-main.renderer';
import {FlBioNetworkObjectColorFunction, FlBioNetworkObjectRenderer} from './fl-bio-network-object.renderer';
import {Observable} from 'rxjs';
import {FlBioNetworkSelectionEvent} from '../model/fl-bio-network-selection.class';
import {FlBioNetworkNodeCofactor} from '../model/fl-bio-network-node-cofactor.class';

type FlLinkColorFunction = (node: FlBioNetworkLink) => string;


export class FlBioNetworkLinksRenderer extends FlBioNetworkObjectRenderer {

  constructor(graphRenderer: FlBioNetworkGraphRenderer,
              options$: Observable<FlBioNetworkOptions>,
              selection$: Observable<FlBioNetworkSelectionEvent>,
              greyColor: string) {
    super(graphRenderer, options$, selection$, greyColor);
  }

  public render(): void {
    this.graphRenderer.graph
    // size based on link weight, set to 1 when the link is not selected
    // .linkWidth((link: FlBioNetworkLink) =>
    //   link.selected ? this.getLinkWidth(link) : 1)
    // .linkDirectionalArrowLength((link: FlBioNetworkLink) => link.isLinkedToCofactor() ? 3 : 10)
    // .linkDirectionalArrowRelPos(0.5)
    // .linkDirectionalParticles(1)
    ;
  }

  protected updateObjectColors(options: FlBioNetworkOptions): void {
    let colorFunc: FlBioNetworkObjectColorFunction;
    if (options.coloredClusters?.length > 0) {
      colorFunc = this.getClusterColorFunction(options.coloredClusters);
    } else {
      colorFunc = this.getLinkColorScaleFunction(options.linkColorScale);
    }

    this.setColorFunction(colorFunc);

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
      this.graphRenderer.graph.linkDirectionalParticles(1);
    } else {
      this.graphRenderer.graph.linkDirectionalParticles(0);
    }

  }

  protected updateVisibility(visibleLevels: FlBioNetworkMetaboliteLevel[], showRelatedCofactor: boolean): void {
    const levelVisibility = this.getLevelVisibilityFunction(visibleLevels);

    let visibilityLink: (object: FlBioNetworkLink) => boolean;

    if (showRelatedCofactor) {
      // show all links and links to cofactors if the cofactor parent reaction is selection
      visibilityLink = (link: FlBioNetworkLink) => {
        if (link.source instanceof FlBioNetworkNodeCofactor) {
          return link.source.parentNode.selected;
        } else if (link.target instanceof FlBioNetworkNodeCofactor) {
          return link.target.parentNode.selected;
        }
        return levelVisibility(link);
      };
    } else {
      visibilityLink = (object: FlBioNetworkLink) => object.isVisible && levelVisibility(object);
    }

    this.graphRenderer.graph.linkVisibility(visibilityLink);
  }


  private getLinkWidth(link: FlBioNetworkLink): number {
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

  private setColorFunction(colorFunction: FlLinkColorFunction): void {
    this.graphRenderer.graph.linkColor((link: FlBioNetworkLink) => {
      // if the link is not selected, always return grey
      if (!link.selected) return this.greyColor;
      return colorFunction(link);
    });
  }

  private setColorScaleFunction(colorMode: FlBioNetworkLinkColorScale): void {
    const colorFunction = this.getLinkColorScaleFunction(colorMode);
    this.setColorFunction(colorFunction);
  }


  private getLinkColorScaleFunction(linkColorScale: FlBioNetworkLinkColorScale): FlLinkColorFunction {
    const colorTransform: (value: number) => number = this.getLinkColorTransformFunction(linkColorScale);
    const colorScale = this.getLinkColorScale(linkColorScale);
    return (link: FlBioNetworkLink) => colorScale(colorTransform(link.absValue));
  }

  // create a color scale for link
  private getLinkColorScale(colorMode: FlBioNetworkLinkColorScale): ScaleLinear<string, any, any> {
    const range: [string, string] = [this.greyColor, FlColorHelper.pinkShiny];

    let max = this.getLinkColorMaxDomain(colorMode);
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
  private getLinkColorMaxDomain(colorMode: FlBioNetworkLinkColorScale): number {

    if (colorMode === 'threshold-75' || colorMode === 'threshold-95') {
      const threshold = colorMode === 'threshold-75' ? 0.75 : 0.95;

      // round all value to merge similar values
      const values = this.graphRenderer.data.getLinksValues().map(value => ClNumberHelper.round(value, 1));
      // remove duplicates
      const uniqueValues = new Set(values);

      // return the quantile
      return quantile(uniqueValues, threshold);
    }

    // for other color modes, return the max value
    const func = this.getLinkColorTransformFunction(colorMode);
    return func(this.graphRenderer.data.getLinksMaxAbsoluteValue());
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
