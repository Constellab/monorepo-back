import {
  FlBioNetwork,
  FlBioNetworkClusterInfo,
  FlBioNetworkCompartment,
  FlBioNetworkMetabolite,
  FlBioNetworkReaction,
  FlPathwayDatabase
} from '../model/fl-bio-network.class';
import {FlBioNetworkHelper} from './fl-bio-network.helper';
import {FlBioNetworkNodeMetabolite} from '../model/fl-bio-network-node-metabolite.class';
import {FlBioNetworkGraph} from '../model/fl-bio-network-graph.class';
import {FlBioNetworkNodeReaction} from '../model/fl-bio-network-node-reaction.class';
import {FlBioNetworkNodeCofactor} from '../model/fl-bio-network-node-cofactor.class';
import {FlBioNetworkLink, FlBioNetworkLinkType} from '../model/fl-bio-network-node-link.class';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';

export class FlBioNetworkFactory {
  private reactions: FlBioNetworkNodeReaction[] = [];
  private metabolites: FlBioNetworkNodeMetabolite[] = [];
  private cofactors: FlBioNetworkNodeCofactor[] = [];
  private links: FlBioNetworkLink[] = [];

  private compartments: FlBioNetworkCompartment[];


  constructor(private themeDetail: FlThemeDetail, private ignoreNodePositions: boolean) {
  }


  public convertNetworkToNetworkD3(network: FlBioNetwork, selectedPathways: string[],
                                   pathwayDatabase: FlPathwayDatabase): FlBioNetworkGraph {
    this.initCompartmentColors(network.compartments);

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
      const existsInMultipleCluster: boolean = reactionsClusters.length > 1;

      // todo need to handle the selected cluster
      const reactionCluster: string = FlBioNetworkHelper.getReactionDefaultCluster(reaction, metabolites);
      const reactionPathways: string[] = FlBioNetworkHelper.getReactionPathwayId(reaction, pathwayDatabase);

      // add the reaction
      const reactionNode = new FlBioNetworkNodeReaction(
        reaction.name ? reaction.name : reaction.id,
        reactionCluster,
        this.themeDetail.greyHighContrast, this.themeDetail.foreground, reaction, reactionPathways,
        existsInMultipleCluster
      );
      reactionNodes.push(reactionNode);
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

      // for each selected cluster of the metabolites, add a node
      const clusters: FlBioNetworkClusterInfo[] =
        metaboliteClusters.filter(cluster => selectedClusters.includes(cluster.clusterId));

      const existsInMultipleCluster: boolean = clusters.length > 1;

      // add one metabolite node for each cluster of the metabolite
      for (const cluster of clusters) {

        // retrieve level of the metabolite
        const positionCluster = metabolite.layout.clusters[cluster.subClusterIds[0]];
        const level = positionCluster?.level ?? metabolite.level;

        // find compartment info
        const compartmentColor = this.getCompartmentColor(metabolite.compartment);

        const metaboliteNode = new FlBioNetworkNodeMetabolite(metabolite.name ? metabolite.name : metabolite.id,
          cluster, level, compartmentColor, this.themeDetail.foreground, metabolite, existsInMultipleCluster);

        // for the metabolite position, take the position of the first sub cluster
        const clusterPosition = metabolite.layout.clusters[cluster.subClusterIds[0]];
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
      for (const metaboliteId of Object.keys(reactionNode.data.metabolites)) {

        const metabolite: FlBioNetworkMetabolite = metabolites.find(metabolite => metabolite.id === metaboliteId);

        if (metabolite == null) {
          console.error(`Could find metabolite with id ${metaboliteId} used in reaction ${reactionNode.data.id}`);
          continue;
        }

        if (metabolite.is_cofactor) {

          // create the cofactor node (ignore its cluster)
          const cofactorNode = this.createCofactor(metabolite);
          this.createLink(reactionNode, cofactorNode);
          reactionNode.addChildNode(cofactorNode);
        } else {
          for (const metaboliteNode of this.metabolites.filter(metabolite => metabolite.data.id === metaboliteId)) {
            this.createLink(reactionNode, metaboliteNode);
          }
        }
      }
    }
  }

  private createLink(reactionNode: FlBioNetworkNodeReaction, metaboliteNode: FlBioNetworkNodeMetabolite | FlBioNetworkNodeCofactor): void {

    let linkType: FlBioNetworkLinkType;

    if (metaboliteNode instanceof FlBioNetworkNodeCofactor) {
      linkType = 'cofactor-link';
    } else {
      linkType = metaboliteNode.cluster.clusterId === reactionNode.clusterId
        ? 'link' : 'cross-cluster-link';
    }

    // if(linkType=== 'cross-cluster-link') return;

    // is the metabolite is consumed, the link goes from the metabolite to the reaction
    if (FlBioNetworkHelper.metaboliteIsConsumed(metaboliteNode.data.id, reactionNode.data)) {
      this.links.push(new FlBioNetworkLink(metaboliteNode, reactionNode,
        reactionNode.data.data, this.themeDetail.greyLowContrast, linkType));
    }
    // left side of the link
    else {
      this.links.push(new FlBioNetworkLink(reactionNode, metaboliteNode,
        reactionNode.data.data, this.themeDetail.greyLowContrast, linkType));
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

  // calculate position of reactions that are not set if possible
  private initReactionPositions(): void {
    for (const reaction of this.reactions) {
      if (!reaction.hasPositions()) {
        // get the connected metabolites that are in the same cluster sorted by level
        let nodes = reaction.getConnectedNodes().filter(n => n.hasPositions()
          && n instanceof FlBioNetworkNodeMetabolite && n.cluster.clusterId === reaction.clusterId);

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

  private initCompartmentColors(compartments: FlBioNetworkCompartment[]): void {
    for (const compartment of compartments) {
      if (ClHelpService.isNullOrEmpty(compartment.color)) {
        // generate a default color
        compartment.color = this.compartmentIdToColor(compartment.id);
      }
    }

    this.compartments = compartments;
  }

  private getCompartmentColor(compartmentId: string): string {
    // find compartment info
    const compartment = this.compartments.find(c => c.id === compartmentId);
    if (compartment == null) {
      console.error(`Compartment '${compartmentId}' not found`);
      return this.compartmentIdToColor(compartmentId);
    }

    return compartment.color;
  }

  private compartmentIdToColor(compartmentId: string): string {
    // as the compartment is a single letter, we duplicate it to have really different colors
    return FlColorHelper.stringToRGBColor(compartmentId + compartmentId + compartmentId
      + compartmentId + compartmentId + compartmentId + compartmentId + compartmentId + compartmentId);
  }
}
