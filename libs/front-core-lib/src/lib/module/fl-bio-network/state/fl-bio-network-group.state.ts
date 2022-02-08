import {Injectable} from '@angular/core';
import {FlD3SelectionSimple} from '../../fl-chart/public-api';
import {FlBioNetworkD3Node} from '../model/fl-bio-network-d3-node.class';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';
import {FlBioNetworkD3Object} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkMetaboliteLevel, flBioNetworkMetaboliteLevels} from '../model/fl-bio-network.class';

const nodeGroupClass: string = 'node-';
const linkGroupClass: string = 'link-';

/**
 * State to store the D3 group select and retrieve different D3 selections
 */
@Injectable()
export class FlBioNetworkGroupState {

  public mainGroup: FlD3SelectionSimple;

  public initGroups(mainGroup: FlD3SelectionSimple): void {
    this.mainGroup = mainGroup;

    // create the link group first so the link are behind the nodes
    for (const nodeLevel of flBioNetworkMetaboliteLevels) {
      mainGroup.append('g').attr('class', this.getLinkClass(nodeLevel));
    }

    for (const nodeLevel of flBioNetworkMetaboliteLevels) {
      mainGroup.append('g').attr('class', this.getNodeClass(nodeLevel));
    }

  }

  public getNodesGroup(nodeLevel: FlBioNetworkMetaboliteLevel): FlD3SelectionSimple<FlBioNetworkD3Link> {
    return this.mainGroup.selectAll(`.${this.getNodeClass(nodeLevel)}`);
  }

  public getLinksGroup(nodeLevel: FlBioNetworkMetaboliteLevel): FlD3SelectionSimple<FlBioNetworkD3Link> {
    return this.mainGroup.selectAll(`.${this.getLinkClass(nodeLevel)}`);
  }

  public get allNodes(): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return this.mainGroup.selectAll(this.getAllNodeClassSelection()).selectChildren();
  }

  public get allLinks(): FlD3SelectionSimple<FlBioNetworkD3Link> {
    return this.mainGroup.selectAll(this.getAllLinkClassSelection()).selectChildren();
  }

  public get visibleNodes(): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return this.allNodes.filter(d => d.visible);
  }

  public get visibleLinks(): FlD3SelectionSimple<FlBioNetworkD3Link> {
    return this.allLinks.filter(d => d.visible);
  }


  // return a selection of all d3 objects
  public get allObjects(): FlD3SelectionSimple<FlBioNetworkD3Object> {
    return this.mainGroup.selectAll(`${this.getAllNodeClassSelection()},${this.getAllLinkClassSelection()}`)
      .selectChildren();
  }

  public clearNetwork(): void {
    this.mainGroup = null;
  }

  /**
   * Retrieve the HTML element of the group containing nodes
   */
  public getNodeGroupElement(nodeLevel: FlBioNetworkMetaboliteLevel): HTMLElement {
    return this.getNodesGroup(nodeLevel).node();
  }

  /**
   * Retrieve the HTML element of the group containing links
   */
  public getLinkGroupElement(nodeLevel: FlBioNetworkMetaboliteLevel): HTMLElement {
    return this.getLinksGroup(nodeLevel).node();
  }

  private getAllNodeClassSelection(): string {
    // eslint-disable-next-line max-len
    return `.${this.getNodeClass(FlBioNetworkMetaboliteLevel.MAJOR)},.${this.getNodeClass(FlBioNetworkMetaboliteLevel.MINOR)},.${this.getNodeClass(FlBioNetworkMetaboliteLevel.COFACTOR)}`;
  }

  private getAllLinkClassSelection(): string {
    // eslint-disable-next-line max-len
    return `.${this.getLinkClass(FlBioNetworkMetaboliteLevel.MAJOR)},.${this.getLinkClass(FlBioNetworkMetaboliteLevel.MINOR)},.${this.getLinkClass(FlBioNetworkMetaboliteLevel.COFACTOR)}`;
  }

  private getNodeClass(nodeLevel: FlBioNetworkMetaboliteLevel): string {
    return nodeGroupClass + nodeLevel;
  }

  private getLinkClass(nodeLevel: FlBioNetworkMetaboliteLevel): string {
    return linkGroupClass + nodeLevel;
  }
}
