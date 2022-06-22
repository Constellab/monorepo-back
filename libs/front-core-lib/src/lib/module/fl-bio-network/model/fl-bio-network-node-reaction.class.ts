import {FlBioNetworkClusterInfo, FlBioNetworkMetaboliteLevel, FlBioNetworkReaction} from './fl-bio-network.class';
import {FlBioNetworkNode} from './fl-bio-network-node.class';

export class FlBioNetworkNodeReaction extends FlBioNetworkNode {

  public type: 'reaction';
  public data: FlBioNetworkReaction;
  public pathwayIds: string[]; // list of pathway for the reaction

  private readonly cofactorDistance = 20;


  constructor(name: string, public cluster: FlBioNetworkClusterInfo,
              defaultColor: string, strokeColor: string,
              data: FlBioNetworkReaction, pathwayIds: string[]) {
    super(name, 'reaction', defaultColor, strokeColor, data);
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
    const levels: number[] = this.getConnectedNodes()
      .filter(node => !(node instanceof FlBioNetworkNodeReaction))
      .map(node => node.getLevel()).sort();

    // return the second-lowest level, this mean that there is at least 2 metabolites linked
    // to this reaction with the level or lower
    if (levels.length >= 2) {
      return levels[1];
    }

    return FlBioNetworkMetaboliteLevel.MINOR;
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
