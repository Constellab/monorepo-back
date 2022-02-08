import {
  FlBioNetwork,
  FlBioNetworkMetabolite,
  FlBioNetworkReaction,
  FlBioNetworkReactionEstimate,
  FlBioNetworkReactionLink,
  FlPathwayDatabase
} from '../model/fl-bio-network.class';
import {FlBioNetworkD3Node, flBioNetworkGetCompartmentColor,} from '../model/fl-bio-network-d3-node.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlBioNetworkHelper} from './fl-bio-network.helper';
import {FlBioNetworkD3Metabolite} from '../model/fl-bio-network-d3-metabolite.class';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkD3Reaction} from '../model/fl-bio-network-d3-reaction.class';
import {FlBioNetworkD3Cofactor} from '../model/fl-bio-network-d3-cofactor.class';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';

export class FlBioNetworkFactory {

  /**
   * Count the number of each cofactor instance to increment an id
   */
  private cofactorsCount: Record<string, number> = {};

  private reactions: FlBioNetworkD3Reaction[] = [];
  private metabolites: FlBioNetworkD3Metabolite[] = [];
  private cofactors: FlBioNetworkD3Cofactor[] = [];
  private links: FlBioNetworkD3Link[] = [];


  constructor(private themeDetail: FlThemeDetail) {
  }


  public convertPathwayToChartPathway(network: FlBioNetwork, selectedPathways: string[],
                                      pathwayDatabase: FlPathwayDatabase): FlBioNetworkD3 {

    // set the reactions
    this.initReactionsNodes(network.reactions, selectedPathways, pathwayDatabase);

    // create the metabolites nodes form the reactions
    this.initMetabolitesNodes(network.metabolites);

    // create the links from the reactions
    this.initLinksAndCofactors(network.metabolites);

    return new FlBioNetworkD3(this.metabolites, this.reactions, this.cofactors, this.links);
  }

  /**
   * return the reactions nodes from the filterPathway using a specific database
   */
  private initReactionsNodes(reactions: FlBioNetworkReaction[], selectedPathways: string[],
                             pathwayDatabase: FlPathwayDatabase): void {
    const reactionNodes: FlBioNetworkD3Reaction[] = [];

    for (const reaction of reactions) {
      // if there is no filter, return all the reaction
      if (ClHelpService.isNullOrEmpty(selectedPathways) ||
        // or the reaction is in one of the filter pathway
        FlBioNetworkHelper.reactionIsInAnyPathway(reaction, selectedPathways, pathwayDatabase)) {

        const reactionPathways: string[] = FlBioNetworkHelper.getReactionPathwayId(reaction, pathwayDatabase);
        // add the reaction
        reactionNodes.push(new FlBioNetworkD3Reaction(reaction.id,
          reaction.name ? reaction.name : reaction.id,
          this.themeDetail.greyHighContrast, this.themeDetail.foreground, reaction, reactionPathways
        ));
      }
    }

    this.reactions = reactionNodes;
  }

  /**
   * return only the metabolites node included in the reactions (to filter with pathway)
   */
  private initMetabolitesNodes(metabolites: FlBioNetworkMetabolite[]): void {

    for (const reaction of this.reactions) {

      // loop on the metabolites included in the reaction
      for (const metaboliteId of Object.keys(reaction.data.metabolites)) {
        // find the metabolite in the list
        const metabolite: FlBioNetworkMetabolite = metabolites.find(metabolite => metabolite.id === metaboliteId);

        if (metabolite == null) {
          console.error('Could find metabolite with id ' + metaboliteId + 'used in reaction ' + reaction.id);
          continue;
        }

        // Skip cofactors, they will be created when creating the links
        if (metabolite.is_cofactor) {
          continue;
        }

        // add the metabolites to the list if it is not already added
        if (this.metabolites.findIndex(node => node.id === metaboliteId) === -1) {
          this.metabolites.push(new FlBioNetworkD3Metabolite(metabolite.id,
            metabolite.name ? metabolite.name : metabolite.id,
            this.getMetaboliteColor(metabolite), this.themeDetail.foreground,

            metabolite
          ));
        }
      }
    }

  }

  // create the pathway link from list of reaction nodes
  // create the cofactors link to the reactions
  private initLinksAndCofactors(metabolites: FlBioNetworkMetabolite[]): void {

    for (const reactionD3 of this.reactions) {
      for (const metaboliteId of Object.keys(reactionD3.data.metabolites)) {

        const metabolite: FlBioNetworkMetabolite = metabolites.find(metabolite => metabolite.id === metaboliteId);

        if (metabolite == null) {
          console.error('Could find metabolite with id ' + metaboliteId + 'used in reaction ' + reactionD3.id);
          continue;

        }

        let metaboliteNode: FlBioNetworkD3Node;
        // if the metabolite is a cofactor, create a node for it
        // and use the cofactor id
        if (metabolite.is_cofactor) {
          const cofactor = this.createCofactor(metabolite);
          reactionD3.addChildNode(cofactor);
          metaboliteNode = cofactor;
        } else {
          // use the metabolite id
          metaboliteNode = this.metabolites.find(m => m.data.id === metabolite.id);
        }

        // get the estimate with a default value if it doesn't exists
        const estimate: FlBioNetworkReactionEstimate = FlBioNetworkHelper.getReactionEstimate(reactionD3.data);
        const reactionLink: FlBioNetworkReactionLink = reactionD3.data.metabolites[metaboliteId];

        // right side of the link
        if (reactionLink.stoich > 0) {
          this.links.push(new FlBioNetworkD3Link(reactionD3, metaboliteNode, estimate, reactionLink.points));
        }
        // left side of the link
        else {
          this.links.push(new FlBioNetworkD3Link(metaboliteNode, reactionD3, estimate, reactionLink.points));
        }
      }
    }
  }

  // create a cofactor and return the node
  private createCofactor(metabolite: FlBioNetworkMetabolite): FlBioNetworkD3Cofactor {
    // get and update the cofactor count
    const id = (this.cofactorsCount[metabolite.chebi_id] ?? 0) + 1;
    this.cofactorsCount[metabolite.chebi_id] = id;
    // generate a unique id for the cofactor
    const cofactorId: string = metabolite.id + ':' + id;


    // create a new object with the new created id
    const cofactor = new FlBioNetworkD3Cofactor(cofactorId,
      metabolite.name ? metabolite.name : metabolite.id,
      this.themeDetail.foreground,
      metabolite
    );
    this.cofactors.push(cofactor);
    return cofactor;
  }


  private getMetaboliteColor(metabolite: FlBioNetworkMetabolite): string {
    return flBioNetworkGetCompartmentColor(metabolite.compartment);
  }

}
