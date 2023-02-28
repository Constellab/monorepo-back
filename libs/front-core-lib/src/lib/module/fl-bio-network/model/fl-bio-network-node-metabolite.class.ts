import {FlBioNetworkNode} from './fl-bio-network-node.class';
import {FlBioNetworkClusterInfo, FlBioNetworkMetabolite, FlBioNetworkMetaboliteLevel} from './fl-bio-network.class';
import {ClHelpService} from '@monorepo/core-lib';


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

  public getChebiId(): string | null {
    return ClHelpService.isNullOrEmpty(this.data.chebi_id) ? null : this.data.chebi_id;
  }
}
