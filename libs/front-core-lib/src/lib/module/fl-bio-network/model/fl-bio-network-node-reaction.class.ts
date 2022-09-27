import {FlBioNetworkMetaboliteLevel, FlBioNetworkReaction} from './fl-bio-network.class';
import {FlBioNetworkNode} from './fl-bio-network-node.class';
import {FlBioNetworkNodeCofactor} from './fl-bio-network-node-cofactor.class';

export class FlBioNetworkNodeReaction extends FlBioNetworkNode {

  public type: 'reaction';
  public data: FlBioNetworkReaction;
  public pathwayIds: string[]; // list of pathway for the reaction
  public clusterId: string;

  private readonly cofactorDistance = 20;


  constructor(name: string, cluster: string,
              defaultColor: string, strokeColor: string,
              data: FlBioNetworkReaction, pathwayIds: string[]) {
    super(name, 'reaction', defaultColor, strokeColor, data);
    this.clusterId = cluster;
    this.pathwayIds = pathwayIds;
  }


  public isInPathway(id: string): boolean {
    return this.pathwayIds.includes(id);
  }

  isInCluster(id: string): boolean {
    return this.clusterId === id;
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
}
