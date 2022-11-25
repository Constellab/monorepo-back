import {FlBioNetworkClusterInfo, FlBioNetworkMetaboliteLevel, FlBioNetworkReaction} from './fl-bio-network.class';
import {FlBioNetworkNode} from './fl-bio-network-node.class';
import {FlBioNetworkNodeCofactor} from './fl-bio-network-node-cofactor.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlExternalLinkService} from '../../../service/fl-external-link.service';
import {FlBioNetworkNodeMetabolite} from './fl-bio-network-node-metabolite.class';

export class FlBioNetworkNodeReaction extends FlBioNetworkNode {

  public type: 'reaction';
  public data: FlBioNetworkReaction;
  public pathwayIds: string[]; // list of pathway for the reaction
  public cluster: FlBioNetworkClusterInfo;

  private readonly cofactorDistance = 20;


  constructor(name: string, cluster: FlBioNetworkClusterInfo,
              defaultColor: string, strokeColor: string,
              data: FlBioNetworkReaction, pathwayIds: string[],
              public existsInMultipleCluster: boolean) {
    super(name, 'reaction', defaultColor, strokeColor, data);
    this.cluster = cluster;
    this.pathwayIds = pathwayIds;
  }


  public isInPathway(id: string): boolean {
    return this.pathwayIds.includes(id);
  }

  isInCluster(id: string): boolean {
    return this.cluster.clusterId === id;
  }


  // The level of the reaction is the lowest level of connected metabolites
  protected _getLevel(): FlBioNetworkMetaboliteLevel {
    if (this.data.level) return this.data.level;


    // Exclude connected FlBioNetworkD3Reaction to avoid infinite loop
    // ignore cofactors
    const levels: number[] = this.getConnectedNodes()
      .filter(node => !(node instanceof FlBioNetworkNodeReaction) && !(node instanceof FlBioNetworkNodeCofactor))
      .map(node => node.getLevel()).sort();

    // if there is only 1 level, return it
    if (levels.length === 1) return levels[0];

    // if the reaction is connected to at least 2 major, it is major, otherwise it is minor
    if (levels.filter(l => l === FlBioNetworkMetaboliteLevel.MAJOR).length >= 2) {
      return FlBioNetworkMetaboliteLevel.MAJOR;
    } else {
      return FlBioNetworkMetaboliteLevel.MINOR;
    }
  }

  /**
   * Set all the cofactors position based on reaction position
   */
  public setCofactorsPositions(): void {

    // init cofactor positions
    const tSpaces = Math.PI * 2 / this.childNodes.length;
    let t = 0;

    for (const node of this.childNodes) {
      const x = this.cofactorDistance * Math.cos(t) + this.x;
      const y = this.cofactorDistance * Math.sin(t) + this.y;
      node.setPositionAndFreeze({x, y});
      t += tSpaces;
    }
  }

  public getRheaId(): string | null {
    return ClHelpService.isNullOrEmpty(this.data.rhea_id) ? null : this.data.rhea_id;
  }

  public getReadIdLink(): string | null {
    const rheaId = this.getRheaId();
    return rheaId ? FlExternalLinkService.getRheaDatabaseReactionLink(rheaId) : null;
  }

  /**
   * Return the next connected metabolite or cofactor
   */
  public getNextMetabolites(): (FlBioNetworkNodeMetabolite | FlBioNetworkNodeCofactor)[] {
    return this.getNextNodes()
      .filter(node => node instanceof FlBioNetworkNodeMetabolite || node instanceof FlBioNetworkNodeCofactor)
      .map(node => node as FlBioNetworkNodeMetabolite | FlBioNetworkNodeCofactor);
  }

  /**
   * Return the previous connected metabolite or cofactor
   */
  public getPreviousMetabolites(): (FlBioNetworkNodeMetabolite | FlBioNetworkNodeCofactor)[] {
    return this.getPreviousNodes()
      .filter(node => node instanceof FlBioNetworkNodeMetabolite || node instanceof FlBioNetworkNodeCofactor)
      .map(node => node as FlBioNetworkNodeMetabolite | FlBioNetworkNodeCofactor);
  }

  /**
   * return the list of same reaction that are in another cluster
   */
  public getSameReactionNodesInOtherCluster(): FlBioNetworkNode[] {
    return this.getConnectedNodes().filter(node => node instanceof FlBioNetworkNodeReaction);
  }

}
