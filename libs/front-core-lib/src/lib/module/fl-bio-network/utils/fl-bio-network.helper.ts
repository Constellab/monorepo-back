import {ClHelpService} from '@monorepo/core-lib';
import {
  FlBioNetworkClusterInfo,
  flBioNetworkIsCofactor,
  FlBioNetworkMetabolite,
  FlBioNetworkReaction,
  FlBioNetworkReactionData,
  FlBioNetworkReactionDataFlux
} from '../model/fl-bio-network.class';

/**
 * Helper class to manipulate {@link FlBioNetwork}
 */
export class FlBioNetworkHelper {

  public static readonly defaultClusterId = 'Default';


  public static getMetaboliteClusters(metabolite: FlBioNetworkMetabolite): FlBioNetworkClusterInfo[] {
    if (Object.keys(metabolite.layout.clusters).length === 0) {
      return [{
        clusterId: FlBioNetworkHelper.defaultClusterId,
        subClusterIds: [FlBioNetworkHelper.defaultClusterId],
      }];
    }

    const clusters: FlBioNetworkClusterInfo[] = [];

    for (const [key, value] of Object.entries(metabolite.layout.clusters)) {
      let cluster = clusters.find(c => c.clusterId === value.id);

      if (!cluster) {
        cluster = {
          clusterId: value.id,
          subClusterIds: [],
        };
        clusters.push(cluster);
      }
      cluster.subClusterIds.push(key);
    }

    return clusters;
  }

  public static getReactionClusters(reaction: FlBioNetworkReaction,
                                    metabolites: FlBioNetworkMetabolite[]): FlBioNetworkClusterInfo[] {
    const clusters: FlBioNetworkClusterInfo[] = [];

    // the reaction is the clusters of all metabolites associated to the reaction (excluding the cofactors)
    for (const metaboliteId of Object.keys(reaction.metabolites)) {
      const metabolite: FlBioNetworkMetabolite = metabolites.find(m => m.id === metaboliteId);
      if (!metabolite || flBioNetworkIsCofactor(metabolite.type)) continue;

      const metabolitesClusters = FlBioNetworkHelper.getMetaboliteClusters(metabolite);
      for (const cluster of metabolitesClusters) {

        const reactionCluster = clusters.find(c => c.clusterId === cluster.clusterId);
        // add the metabolite cluster to the reaction cluster
        if (!reactionCluster) {
          clusters.push(ClHelpService.deepClone(cluster));
        } else {
          // todo merge sub cluster ids and remove duplicate
          reactionCluster.subClusterIds = reactionCluster.subClusterIds.concat(cluster.subClusterIds);
        }
      }
    }

    // set the default cluster at last position
    return clusters.sort(cluster => cluster.clusterId === FlBioNetworkHelper.defaultClusterId ? 1 : -1);
  }

  /**
   * Return true if the metabolite is consumed in a reaction.
   */
  public static metaboliteIsConsumed(metaboliteId: string, reaction: FlBioNetworkReaction): boolean {
    const simulation = FlBioNetworkHelper.getReactionSimulationValue(reaction.data);
    // if the simulation value is negative, the link is inverted
    return (simulation * reaction.metabolites[metaboliteId]) < 0;
  }

  public static metaboliteValueIsConsumed(value: number): boolean {
    return value < 0;
  }

  public static getReactionSimulationValue(reactionData: FlBioNetworkReactionData): number {
    const simulation = FlBioNetworkHelper.getReactionFlux(reactionData);
    return (simulation && typeof simulation.value === 'number') ? simulation.value : 1;
  }

  public static getReactionFlux(reactionData: FlBioNetworkReactionData): FlBioNetworkReactionDataFlux | null {
    if (ClHelpService.isNullOrEmpty(reactionData.simulations)) return null;
    return Object.values(reactionData.simulations)[0];
  }
}
