import {FlBioNetworkNodeMetabolite} from './fl-bio-network-node-metabolite.class';
import {FlBioNetworkNodeReaction} from './fl-bio-network-node-reaction.class';
import {FlBioNetworkNodeCofactor} from './fl-bio-network-node-cofactor.class';
import {FlBioNetworkLink} from './fl-bio-network-node-link.class';
import {FlBioNetworkNode} from './fl-bio-network-node.class';
import {FlBioNetworkMetabolite, FlBioNetworkMetaboliteLevel} from './fl-bio-network.class';


/**
 * Data used to construct to d3 network
 */
export class FlBioNetworkGraph {

  constructor(public metabolites: FlBioNetworkNodeMetabolite[],
              public reactions: FlBioNetworkNodeReaction[],
              public cofactors: FlBioNetworkNodeCofactor[],
              public links: FlBioNetworkLink[]) {
  }

  /**
   * return all the nodes
   */
  public getAllNodes(): FlBioNetworkNode[] {
    return [...this.getMetaboliteAndCofactors(), ...this.reactions];
  }

  public getMetabolitesAndReactions(): FlBioNetworkNode[] {
    return [...this.metabolites, ...this.reactions];
  }

  /**
   * return all the metabolites nodes
   */
  public getMetaboliteAndCofactors(): (FlBioNetworkNodeMetabolite | FlBioNetworkNodeCofactor)[] {
    return [...this.metabolites, ...this.cofactors];
  }

  // return all the nodes of a level
  public getNodes(level: FlBioNetworkMetaboliteLevel): FlBioNetworkNode[] {
    return this.getAllNodes().filter(link => link.getLevel() === level);
  }

  // return all the link of a level
  public getLinks(level: FlBioNetworkMetaboliteLevel): FlBioNetworkLink[] {
    return this.links.filter(link => link.getLevel() === level);
  }

  public getMetaboliteAndReactionLinks(): FlBioNetworkLink[] {
    return this.links.filter(link => link.getLevel() !== FlBioNetworkMetaboliteLevel.COFACTOR);
  }

  // return all the reaction of a pathway
  public getReactionsOfPathway(pathwayId: string): FlBioNetworkNodeReaction[] {
    return this.reactions.filter(reaction => reaction.isInPathway(pathwayId));
  }

  public getAllObjects(): FlBioNetworkGraphObject[] {
    return [...this.getAllNodes(), ...this.links];
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

  public getLinksValues(): number[] {
    return this.links.map(link => link.absValue);
  }

  // return the min and max value of all links
  public getLinksMaxAbsoluteValue(): number {
    return Math.max(...this.links.map(link => link.absValue));
  }

  public allNodesHavePositions(): boolean {
    return this.metabolites.every(metabolite => metabolite.x != null && metabolite.y != null) &&
      this.reactions.every(reaction => reaction.x != null && reaction.y != null);
    // true if the node have a position, in this case, no need to launch simulation
    // return this.metabolites[0]?.x != null && this.metabolites[0]?.x !== 0;
  }

  public savePositions(): void {
    this.getMetabolitesAndReactions().forEach(node => node.savePosition());
  }

  public initPositions(): void {
    this.getAllNodes().forEach(node => node.initPosition());
  }

  // return the lowest level of objects
  public getLowestLevel(): number {
    return Math.min(...this.getAllNodes().map(node => node.getLevel()));
  }

  /**
   * return the metabolite data (not the nodes) and not duplicated
   */
  public getMetabolitesData(): FlBioNetworkMetabolite[] {
    const metabolitesData: FlBioNetworkMetabolite[] = [];
    for (const metabolite of this.metabolites) {
      if (metabolitesData.find(metaboliteData => metaboliteData.id === metabolite.data.id) == null) {
        metabolitesData.push(metabolite.data);
      }
    }
    return metabolitesData;
  }

  public getMetabolitesNodes(metaboliteId: string): FlBioNetworkNodeMetabolite[] {
    return this.metabolites.filter(metabolite => metabolite.data.id === metaboliteId);
  }

  /**
   * Set all the cofactors position based on reaction position
   */
  public setCofactorsPositions(): void {
    for (const reaction of this.reactions) {

      reaction.setCofactorsPositions();
    }
  }
}

// Any object in the network
export abstract class FlBioNetworkGraphObject {

  // use to store the level if there is some calculation
  protected _level: number;

  // set to true when the object is selected (highlighted)
  public selected: boolean = false;


  defaultColor: string;

  public getLevel(): FlBioNetworkMetaboliteLevel {
    if (this._level == null) {
      this._level = this._getLevel();
    }
    return this._level;
  }

  // the lower the level, the most important the node is
  // level for the zoom
  protected abstract _getLevel(): FlBioNetworkMetaboliteLevel;

  public abstract isInPathway(id: string): boolean;

  public abstract isInCluster(id: string): boolean;


}
