import {FlBioNetworkNode} from './fl-bio-network-node.class';
import {FlBioNetworkClusterInfo, FlBioNetworkMetabolite, FlBioNetworkMetaboliteLevel} from './fl-bio-network.class';
import {FlBioNetworkNodeReaction} from './fl-bio-network-node-reaction.class';


export class FlBioNetworkNodeMetabolite extends FlBioNetworkNode {

  public type: 'metabolite';
  public data: FlBioNetworkMetabolite;

  constructor(name: string, public cluster: FlBioNetworkClusterInfo, public level: FlBioNetworkMetaboliteLevel,
              defaultColor: string, strokeColor: string, data: FlBioNetworkMetabolite,
              public existsInMultipleCluster: boolean) {
    super(name, 'metabolite', defaultColor, strokeColor, data);
  }


  isMajor(): boolean {
    return this._getLevel() === FlBioNetworkMetaboliteLevel.MAJOR;
  }

  protected _getLevel(): FlBioNetworkMetaboliteLevel {
    return this.level;
  }

  isInPathway(id: string): boolean {
    // check if any connected reaction is in the pathway
    return this.getConnectedNodes().filter(n => n instanceof FlBioNetworkNodeReaction).some(n => n.isInPathway(id));
  }

  isInCluster(id: string): boolean {
    return this.cluster.clusterId === id;
  }

  savePosition(): void {
    const center = this.getCoords();
    const cluster = this.data.layout.clusters[this.cluster.subClusterIds[0]];
    if (cluster) {
      cluster.x = center.x;
      cluster.y = center.y;
    }
  }
}
