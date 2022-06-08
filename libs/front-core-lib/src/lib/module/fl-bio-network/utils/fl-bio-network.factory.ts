import {
  FlBioNetwork,
  FlBioNetworkCluster,
  FlBioNetworkMetabolite,
  FlBioNetworkReaction,
  FlBioNetworkReactionEstimate,
  FlBioNetworkReactionLink,
  FlPathwayDatabase
} from '../model/fl-bio-network.class';
import {FlBioNetworkHelper} from './fl-bio-network.helper';
import {FlBioNetworkD3Metabolite} from '../model/fl-bio-network-d3-metabolite.class';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkD3Reaction} from '../model/fl-bio-network-d3-reaction.class';
import {FlBioNetworkD3Cofactor} from '../model/fl-bio-network-d3-cofactor.class';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';
import {flBioNetworkCompartments} from '../model/fl-bio-network-compartment.class';
import {FlBioNetworkD3Node} from '../model/fl-bio-network-d3-node.class';

export class FlBioNetworkFactory {
  private reactions: FlBioNetworkD3Reaction[] = [];
  private metabolites: FlBioNetworkD3Metabolite[] = [];
  private cofactors: FlBioNetworkD3Cofactor[] = [];
  private links: FlBioNetworkD3Link[] = [];


  constructor(private themeDetail: FlThemeDetail) {
  }


  public convertPathwayToChartPathway(network: FlBioNetwork, selectedPathways: string[],
                                      pathwayDatabase: FlPathwayDatabase): FlBioNetworkD3 {

    // create the metabolites nodes form the reactions
    this.initMetabolitesNodes(network.metabolites, selectedPathways);

    // set the reactions
    this.initReactionsNodes(network.reactions, network.metabolites, selectedPathways, pathwayDatabase);

    // create the links from the reactions
    this.initLinksAndCofactors(network.metabolites);

    this.initReactionPositions();

    return new FlBioNetworkD3(this.metabolites, this.reactions, this.cofactors, this.links);
  }

  /**
   * return the reactions nodes from the filterPathway using a specific database
   */
  private initReactionsNodes(reactions: FlBioNetworkReaction[],
                             metabolites: FlBioNetworkMetabolite[],
                             selectedCluster: string[],
                             pathwayDatabase: FlPathwayDatabase): void {
    const reactionNodes: FlBioNetworkD3Reaction[] = [];

    for (const reaction of reactions) {

      const reactionsClusters: string[] = FlBioNetworkHelper.getReactionClusters(reaction, metabolites);
      const reactionPathways: string[] = FlBioNetworkHelper.getReactionPathwayId(reaction, pathwayDatabase);

      for (const cluster of selectedCluster) {
        if (reactionsClusters.includes(cluster)) {
          // add the reaction
          const reactionNode = new FlBioNetworkD3Reaction(
            reaction.name ? reaction.name : reaction.id,
            cluster,
            this.themeDetail.greyHighContrast, this.themeDetail.foreground, reaction, reactionPathways
          );
          reactionNodes.push(reactionNode);
        }

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

      // add one metabolite node for each cluster of the metabolite
      for (const cluster of selectedClusters) {
        if (!FlBioNetworkHelper.metaboliteIsInCluster(metabolite, cluster)) continue;

        const metaboliteCluster: FlBioNetworkCluster = metabolite.layout.clusters[cluster];

        const metaboliteNode = new FlBioNetworkD3Metabolite(metabolite.name ? metabolite.name : metabolite.id,
          cluster, this.getMetaboliteColor(metabolite.compartment), this.themeDetail.foreground, metabolite);

        if (metaboliteCluster && metaboliteCluster.x != null && metaboliteCluster.y != null) {
          metaboliteNode.setCenterAndFreeze(metaboliteCluster);
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


        let metaboliteNode: FlBioNetworkD3Node;

        if (metabolite.is_cofactor) {
          metaboliteNode = this.createCofactor(metabolite);
          reactionNode.addChildNode(metaboliteNode);
        } else {
          metaboliteNode = this.metabolites.find(metabolite => metabolite.data.id === metaboliteId
            && metabolite.clusterId === reactionNode.clusterId);
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
          this.links.push(new FlBioNetworkD3Link(reactionNode, metaboliteNode,
            estimate, reactionLink.points, this.themeDetail.greyLowContrast));
        }
        // left side of the link
        else {
          this.links.push(new FlBioNetworkD3Link(metaboliteNode, reactionNode,
            estimate, reactionLink.points, this.themeDetail.greyLowContrast));
        }

        find = true;


        // const metabolite: FlBioNetworkMetabolite = metabolites.find(metabolite => metabolite.id === metaboliteId);
        //
        // }
        //
        // let metaboliteNode: FlBioNetworkD3Node;
        // // if the metabolite is a cofactor, create a node for it
        // // and use the cofactor id
        // if (metabolite.is_cofactor) {
        //   const cofactor = this.createCofactor(metabolite);
        //   reactionNode.addChildNode(cofactor);
        //   metaboliteNode = cofactor;
        // } else {
        //   // use the metabolite id
        //   metaboliteNode = this.metabolites.find(m => m.data.id === metabolite.id);
        // }
        //
        // // get the estimate with a default value if it doesn't exist
        // const estimate: FlBioNetworkReactionEstimate = FlBioNetworkHelper.getReactionEstimate(reactionNode.data);
        // const reactionLink: FlBioNetworkReactionLink = reactionNode.data.metabolites[metaboliteId];
        //
        // // right side of the link
        // // if the estimate is negative, the link is inverted
        // const estimateValue: number = typeof estimate.value === 'number' ? estimate.value : 1;
        // if (reactionLink.stoich * estimateValue > 0) {
        //   this.links.push(new FlBioNetworkD3Link(reactionNode, metaboliteNode,
        //     estimate, reactionLink.points, this.themeDetail.greyLowContrast));
        // }
        // // left side of the link
        // else {
        //   this.links.push(new FlBioNetworkD3Link(metaboliteNode, reactionNode,
        //     estimate, reactionLink.points, this.themeDetail.greyLowContrast));
        // }
      }

      if (!find) {
        console.log(reactionNode);
      }
    }
  }

  // create a cofactor and return the node
  private createCofactor(metabolite: FlBioNetworkMetabolite): FlBioNetworkD3Cofactor {
    // create a new object with the new created id
    const cofactor = new FlBioNetworkD3Cofactor(metabolite.name ? metabolite.name : metabolite.id,
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
        if (nodes.length >= 2) {
          const firstPosition = nodes[0].getCenter();
          const secondPosition = nodes[1].getCenter();
          reaction.setCenter({
            x: (firstPosition.x + secondPosition.x) / 2,
            y: (firstPosition.y + secondPosition.y) / 2
          });
          // set the fixed positions
          reaction.freezePosition();
        }
      }
    }
  }
}
