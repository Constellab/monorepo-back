import {Injectable} from '@angular/core';
import {FlD3SelectionSimple} from '../../fl-chart/public-api';
import {FlBioNetworkD3Node} from '../model/fl-bio-network-d3-node.class';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';
import {FlBioNetworkD3Object} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkMetaboliteLevel, flBioNetworkMetaboliteLevels} from '../model/fl-bio-network.class';


/**
 * State to store the D3 group select and retrieve different D3 selections
 */
@Injectable()
export class FlBioNetworkGroupState {

  private static readonly nodeGroupClass = 'node-';
  private static readonly linkGroupClass = 'link-';

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

  public getNodesGroup(nodeLevels: FlBioNetworkMetaboliteLevel[]): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return this.mainGroup.selectAll(this.getNodeClassSelections(nodeLevels));
  }

  public getLinksGroup(nodeLevels: FlBioNetworkMetaboliteLevel[]): FlD3SelectionSimple<FlBioNetworkD3Link> {
    return this.mainGroup.selectAll(this.getLinkClassSelections(nodeLevels));
  }

  public getNodes(nodeLevels: FlBioNetworkMetaboliteLevel[]): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return this.getNodesGroup(nodeLevels).selectChildren();
  }

  public getLinks(nodeLevels: FlBioNetworkMetaboliteLevel[]): FlD3SelectionSimple<FlBioNetworkD3Link> {
    return this.getLinksGroup(nodeLevels).selectChildren();
  }

  public get allNodes(): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return this.mainGroup.selectAll(this.getAllNodeClassSelection()).selectChildren();
  }

  public get allLinks(): FlD3SelectionSimple<FlBioNetworkD3Link> {
    return this.mainGroup.selectAll(this.getAllLinkClassSelection()).selectChildren();
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
    return this.getNodesGroup([nodeLevel]).node();
  }

  /**
   * Retrieve the HTML element of the group containing links
   */
  public getLinkGroupElement(nodeLevel: FlBioNetworkMetaboliteLevel): HTMLElement {
    return this.getLinksGroup([nodeLevel]).node();
  }

  private getAllNodeClassSelection(): string {
    return this.getNodeClassSelections(flBioNetworkMetaboliteLevels);
  }


  private getAllLinkClassSelection(): string {
    return this.getLinkClassSelections(flBioNetworkMetaboliteLevels);
  }

  private getNodeClassSelections(nodeLevels: FlBioNetworkMetaboliteLevel[]): string {
    return nodeLevels.map(nodeLevel => '.' + this.getNodeClass(nodeLevel)).join(',');
  }

  private getLinkClassSelections(nodeLevels: FlBioNetworkMetaboliteLevel[]): string {
    return nodeLevels.map(nodeLevel => '.' + this.getLinkClass(nodeLevel)).join(',');
  }


  private getNodeClass(nodeLevel: FlBioNetworkMetaboliteLevel): string {
    return FlBioNetworkGroupState.nodeGroupClass + nodeLevel;
  }

  private getLinkClass(nodeLevel: FlBioNetworkMetaboliteLevel): string {
    return FlBioNetworkGroupState.linkGroupClass + nodeLevel;
  }

  public isReady(): boolean {
    return this.mainGroup != null;
  }
}
