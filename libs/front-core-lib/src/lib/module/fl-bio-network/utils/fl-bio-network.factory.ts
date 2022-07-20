import {
  FlBioNetwork,
  FlBioNetworkClusterInfo,
  FlBioNetworkMetabolite,
  FlBioNetworkReaction,
  FlBioNetworkReactionEstimate,
  FlBioNetworkReactionLink,
  FlPathwayDatabase
} from '../model/fl-bio-network.class';
import {FlBioNetworkHelper} from './fl-bio-network.helper';
import {FlBioNetworkNodeMetabolite} from '../model/fl-bio-network-node-metabolite.class';
import {FlBioNetworkGraph} from '../model/fl-bio-network-graph.class';
import {FlBioNetworkNodeReaction} from '../model/fl-bio-network-node-reaction.class';
import {FlBioNetworkNodeCofactor} from '../model/fl-bio-network-node-cofactor.class';
import {FlBioNetworkLink} from '../model/fl-bio-network-node-link.class';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';
import {flBioNetworkCompartments} from '../model/fl-bio-network-compartment.class';
import {FlBioNetworkNode} from '../model/fl-bio-network-node.class';

export class FlBioNetworkFactory {
  private reactions: FlBioNetworkNodeReaction[] = [];
  private metabolites: FlBioNetworkNodeMetabolite[] = [];
  private cofactors: FlBioNetworkNodeCofactor[] = [];
  private links: FlBioNetworkLink[] = [];


  constructor(private themeDetail: FlThemeDetail, private ignoreNodePositions: boolean) {
  }


  public convertNetworkToNetworkD3(network: FlBioNetwork, selectedPathways: string[],
                                   pathwayDatabase: FlPathwayDatabase): FlBioNetworkGraph {

    // create the metabolites nodes form the reactions
    this.initMetabolitesNodes(network.metabolites, selectedPathways);

    // set the reactions
    this.initReactionsNodes(network.reactions, network.metabolites, selectedPathways, pathwayDatabase);

    // create the links from the reactions
    this.initLinksAndCofactors(network.metabolites);

    this.initReactionPositions();

    return new FlBioNetworkGraph(this.metabolites, this.reactions, this.cofactors, this.links);
  }

  /**
   * return the reactions nodes from the filterPathway using a specific database
   */
  private initReactionsNodes(reactions: FlBioNetworkReaction[],
                             metabolites: FlBioNetworkMetabolite[],
                             selectedCluster: string[],
                             pathwayDatabase: FlPathwayDatabase): void {
    const reactionNodes: FlBioNetworkNodeReaction[] = [];

    for (const reaction of reactions) {

      const reactionsClusters: FlBioNetworkClusterInfo[] = FlBioNetworkHelper.getReactionClusters(reaction, metabolites);
      const reactionPathways: string[] = FlBioNetworkHelper.getReactionPathwayId(reaction, pathwayDatabase);

      for (const cluster of selectedCluster) {
        const reactionCluster: FlBioNetworkClusterInfo = reactionsClusters.find(c => c.clusterId === cluster);

        if (!reactionCluster) continue;

        // add the reaction
        const reactionNode = new FlBioNetworkNodeReaction(
          reaction.name ? reaction.name : reaction.id,
          reactionCluster,
          this.themeDetail.greyHighContrast, this.themeDetail.foreground, reaction, reactionPathways
        );
        reactionNodes.push(reactionNode);
      }
    }

    this.reactions = reactionNodes;
  }

  /**
   * return only the metabolites node included in the reactions (to filter with pathway)
   */
  private initMetabolitesNodes(metabolites: FlBioNetworkMetabolite[], selectedClusters: string[]): void {

    for (const metabolite of metabolites) {
      // Skip cofactors, they will be created when creating the links
      if (metabolite.is_cofactor) {
        continue;
      }
      const metaboliteClusters: FlBioNetworkClusterInfo[] = FlBioNetworkHelper.getMetaboliteClusters(metabolite);

      // add one metabolite node for each cluster of the metabolite
      for (const cluster of selectedClusters) {
        const metaboliteCluster: FlBioNetworkClusterInfo = metaboliteClusters.find(c => c.clusterId === cluster);

        if (!metaboliteCluster) continue;

        // retrieve level of the metabolite
        const positionCluster = metabolite.layout.clusters[metaboliteCluster.subClusterIds[0]];
        const level = positionCluster?.level ?? metabolite.level;


        const metaboliteNode = new FlBioNetworkNodeMetabolite(metabolite.name ? metabolite.name : metabolite.id,
          metaboliteCluster, level, this.getMetaboliteColor(metabolite.compartment), this.themeDetail.foreground, metabolite);

        // for the metabolite position, take the position of the first sub cluster
        const clusterPosition = metabolite.layout.clusters[metaboliteCluster.subClusterIds[0]];
        if (!this.ignoreNodePositions && clusterPosition && clusterPosition.x != null && clusterPosition.y != null) {
          metaboliteNode.setPositionAndFreeze(clusterPosition);
        }

        this.metabolites.push(metaboliteNode);
      }

    }

  }

  // create the pathway link from list of reaction nodes
  // create the cofactors link to the reactions
  private initLinksAndCofactors(metabolites: FlBioNetworkMetabolite[]): void {

    for (const reactionNode of this.reactions) {

      let find = false;
      for (const metaboliteId of Object.keys(reactionNode.data.metabolites)) {

        const metabolite: FlBioNetworkMetabolite = metabolites.find(metabolite => metabolite.id === metaboliteId);

        if (metabolite == null) {
          console.error(`Could find metabolite with id ${metaboliteId} used in reaction ${reactionNode.data.id}`);
          continue;
        }


        let metaboliteNode: FlBioNetworkNode;

        if (metabolite.is_cofactor) {

          // check if the cofactor is in the cluster of the reaction
          const metaboliteClusters: FlBioNetworkClusterInfo[] = FlBioNetworkHelper.getMetaboliteClusters(metabolite);
          const metaboliteCluster: FlBioNetworkClusterInfo = metaboliteClusters.find(c => c.clusterId === reactionNode.cluster.clusterId);

          // if not in the cluster, skip
          if(metaboliteCluster == null){
            continue;
          }

          // if the cofactor is in the cluster, create the node
          metaboliteNode = this.createCofactor(metabolite);
          reactionNode.addChildNode(metaboliteNode);
        } else {
          metaboliteNode = this.metabolites.find(metabolite => metabolite.data.id === metaboliteId
            && metabolite.cluster.clusterId === reactionNode.cluster.clusterId);
        }

        if (metaboliteNode == null) {
          // console.error(`Could find metabolite with id ${metaboliteId} and cluster ${reactionNode.clusterId}
          //       used in reaction ${reactionNode.name}`);
          continue;
        }


        // get the estimate with a default value if it doesn't exist
        const estimate: FlBioNetworkReactionEstimate = FlBioNetworkHelper.getReactionEstimate(reactionNode.data);
        const reactionLink: FlBioNetworkReactionLink = reactionNode.data.metabolites[metaboliteId];

        // right side of the link
        // if the estimate is negative, the link is inverted
        const estimateValue: number = typeof estimate.value === 'number' ? estimate.value : 1;
        if (reactionLink.stoich * estimateValue > 0) {
          this.links.push(new FlBioNetworkLink(reactionNode, metaboliteNode,
            estimate, reactionLink.points, this.themeDetail.greyLowContrast));
        }
        // left side of the link
        else {
          this.links.push(new FlBioNetworkLink(metaboliteNode, reactionNode,
            estimate, reactionLink.points, this.themeDetail.greyLowContrast));
        }

        find = true;

      }

      if (!find) {
        console.log(reactionNode);
      }
    }
  }

  // create a cofactor and return the node
  private createCofactor(metabolite: FlBioNetworkMetabolite): FlBioNetworkNodeCofactor {
    // create a new object with the new created id
    const cofactor = new FlBioNetworkNodeCofactor(metabolite.name ? metabolite.name : metabolite.id,
      this.themeDetail.foreground,
      metabolite
    );
    this.cofactors.push(cofactor);
    return cofactor;
  }


  private getMetaboliteColor(compartment: string): string {
    const compartmentColor = flBioNetworkCompartments.find(c => c.id === compartment);
    if (compartmentColor) return compartmentColor.color;

    // as the compartment is a single letter, we duplicate it to have really different colors
    return FlColorHelper.stringToRGBColor(compartment + compartment + compartment
      + compartment + compartment + compartment + compartment + compartment + compartment);
  }

  // calculate position of reactions that are not set if possible
  private initReactionPositions(): void {
    for (const reaction of this.reactions) {
      if (!reaction.hasPositions()) {
        // get the connected nodes sorted by level
        let nodes = reaction.getConnectedNodes().filter(n => n.hasPositions());

        nodes = nodes.sort((a, b) => a.getLevel() - b.getLevel());

        // if there are at least 2 link nodes with position, set the reaction in the center of the 2
        if (!this.ignoreNodePositions && nodes.length >= 2) {
          const firstPosition = nodes[0].getCoords();
          const secondPosition = nodes[1].getCoords();
          reaction.setPositionAndFreeze({
            x: (firstPosition.x + secondPosition.x) / 2,
            y: (firstPosition.y + secondPosition.y) / 2
          });
        }
      }
    }
  }
}
