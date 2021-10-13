import {FlBioNetworkD3Metabolite} from './fl-bio-network-d3-metabolite.class';
import {FlBioNetworkD3Reaction} from './fl-bio-network-d3-reaction.class';
import {FlBioNetworkD3Cofactor} from './fl-bio-network-d3-cofactor.class';
import {FlBioNetworkD3Link} from './fl-bio-network-d3-link.class';
import {FlBioNetworkD3Node} from './fl-bio-network-d3-node.class';

/**
 * Data used to construct to d3 network
 */
export class FlBioxNetworkD3 {


  constructor(public metabolites: FlBioNetworkD3Metabolite[],
              public reactions: FlBioNetworkD3Reaction[],
              public cofactors: FlBioNetworkD3Cofactor[],
              public links: FlBioNetworkD3Link[]) {
  }

  /**
   * return all the nodes
   */
  public getAllNodes(): FlBioNetworkD3Node[] {
    return [...this.getMetabolitesNodes(), ...this.reactions];
  }

  public getMetabolitesAndReactions(): FlBioNetworkD3Node[] {
    return [...this.metabolites, ...this.reactions];
  }

  /**
   * return all the metabolites nodes
   */
  public getMetabolitesNodes(): (FlBioNetworkD3Metabolite | FlBioNetworkD3Cofactor)[] {
    return [...this.metabolites, ...this.cofactors];
  }

  // return all the reaction of a pathway
  public getReactionsOfPathway(pathwayId: string): FlBioNetworkD3Reaction[] {
    return this.reactions.filter(reaction => reaction.isInPathway(pathwayId));
  }

  // return all the link except for link to cofactors
  public getMetaboliteLinks(): FlBioNetworkD3Link[] {
    return this.links.filter(link => !link.isLinkedToCofactor());
  }

  // return all the link that are link to cofactors
  public getCofactorLinks(): FlBioNetworkD3Link[] {
    return this.links.filter(link => link.isLinkedToCofactor());
  }


  // return the min and max value of all links
  public getLinksDomain(): [number, number] {
    let min: number = 0;
    let max: number = 0;

    for (const link of this.links) {
      if (link.value > max) {
        max = link.value;
      } else if (link.value < min) {
        min = link.value;
      }
    }

    return [min, max];
  }

  // return the min and max value of all links
  public getLinksMaxAbsoluteValue(): number {
    let max: number = 0;

    for (const link of this.links) {
      if (link.absValue > max) {
        max = link.absValue;
      }
    }

    return max;
  }

  public hasPosition(): boolean {
    // true if the node have a position, in this case, no need to launch simulation
    return this.metabolites[0]?.x != null && this.metabolites[0]?.x !== 0;
  }

  public savePositions(): void {
    this.getMetabolitesAndReactions().forEach(node => node.savePosition());
  }

  public initPositions(): void {
    this.getAllNodes().forEach(node => node.initPosition());
  }
}
