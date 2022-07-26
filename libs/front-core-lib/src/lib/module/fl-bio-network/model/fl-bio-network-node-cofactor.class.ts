import {FlBioNetworkMetabolite, FlBioNetworkMetaboliteLevel} from './fl-bio-network.class';
import {FlBioNetworkNode} from './fl-bio-network-node.class';
import {FlBioNetworkNodeReaction} from './fl-bio-network-node-reaction.class';


export class FlBioNetworkNodeCofactor extends FlBioNetworkNode {
  public type: 'cofactor';

  public data: FlBioNetworkMetabolite;

  constructor(name: string, defaultColor: string, data: FlBioNetworkMetabolite) {
    super(name, 'cofactor', '#ffaa33', defaultColor, data);
  }

  protected _getLevel(): FlBioNetworkMetaboliteLevel {
    return FlBioNetworkMetaboliteLevel.COFACTOR;
  }

  isInPathway(id: string): boolean {
    // check if any connected reaction is in the pathway
    return this.getConnectedNodes().filter(n => n instanceof FlBioNetworkNodeReaction).some(n => n.isInPathway(id));
  }

  isInCluster(id: string): boolean {
    // check if any connected reaction is in the cluster
    // return this.getConnectedNodes().filter(n => n instanceof FlBioNetworkNodeReaction).some(n => n.isInCluster(id));
    // the cofactors do not have a cluster, so we return false
    return false;
  }


}
