import {Injectable} from '@angular/core';
import {FlBioNetworkD3Link, FlBioNetworkD3Node, FlBioNetworkD3Object, FlD3SelectionSimple} from '@monorepo/front-core-lib';

const nodeGroupClass: string = 'node-group';
const linksGroupClass: string = 'links-group';
const cofactorGroupClass: string = 'cofactor-group';
const cofactorLinksGroupClass: string = 'cofactor-links';

/**
 * State to store the D3 group select and retrieve different D3 selections
 */
@Injectable()
export class FlBioNetworkGroupState {

  public mainGroup: FlD3SelectionSimple;
  public nodeGroup: FlD3SelectionSimple;
  public linkGroup: FlD3SelectionSimple;

  public cofactorGroup: FlD3SelectionSimple;
  public cofactorLinkGroup: FlD3SelectionSimple;


  public initGroups(mainGroup: FlD3SelectionSimple): void {
    this.mainGroup = mainGroup;

    // set link groups first to set them in background
    // cofactor link group
    this.cofactorLinkGroup = mainGroup.append('g').attr('class', cofactorLinksGroupClass);

    //link group
    this.linkGroup = mainGroup.append('g').attr('class', linksGroupClass);

    // cofactor group
    this.cofactorGroup = mainGroup.append('g').attr('class', cofactorGroupClass);
    // node group
    this.nodeGroup = mainGroup.append('g').attr('class', nodeGroupClass);
  }


  public get nodes(): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return this.mainGroup.selectAll(`.${nodeGroupClass},.${cofactorGroupClass}`).selectChildren();
  }

  public get links(): FlD3SelectionSimple<FlBioNetworkD3Link> {
    return this.mainGroup.selectAll(`.${linksGroupClass},.${cofactorLinksGroupClass}`).selectChildren();
  }

  public get visibleNodes(): FlD3SelectionSimple<FlBioNetworkD3Node> {
    return this.nodes.filter(d => d.visible);
  }

  public get visibleLinks(): FlD3SelectionSimple<FlBioNetworkD3Link> {
    return this.links.filter(d => d.visible);
  }


  // return a selection of all d3 objects
  public get allObjects(): FlD3SelectionSimple<FlBioNetworkD3Object> {
    return this.mainGroup.selectAll(`.${nodeGroupClass},.${cofactorGroupClass},.${linksGroupClass},.${cofactorLinksGroupClass}`)
      .selectChildren();
  }

  public clearNetwork(): void {
    this.mainGroup = null;
    this.linkGroup = null;
    this.nodeGroup = null;
    this.cofactorGroup = null;
    this.cofactorLinkGroup = null;
  }
}
