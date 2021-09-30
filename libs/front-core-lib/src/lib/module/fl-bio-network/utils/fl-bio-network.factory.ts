import {
  FlBioNetwork,
  FlBioNetworkMetabolite,
  FlBioNetworkReaction,
  FlBioNetworkReactionEstimate,
  FlPathwayDatabase
} from '../model/fl-bio-network.class';
import {flBioNetworkGetCompartmentColor,} from '../model/fl-bio-network-d3.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlBioNetworkHelper} from './fl-bio-network.helper';
import {flBioNetworkCofactor} from '../model/fl-bio-cofactor.class';
import {FlBioNetworkD3Metabolite} from '../model/fl-bio-network-d3-metabolite.class';
import {FlBioxNetworkD3} from '../model/fl-bio-network-d3-network.class';
import {FlBioNetworkD3Reaction} from '../model/fl-bio-network-d3-reaction.class';
import {FlBioNetworkD3Cofactor} from '../model/fl-bio-network-d3-cofactor.class';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';

export class FlBioNetworkFactory {

  /**
   * Count the number of each cofactor instance to increment an id
   */
  private cofactorsCount: Record<string, number> = {};

  private reactions: FlBioNetworkD3Reaction[] = [];
  private metabolites: FlBioNetworkD3Metabolite[] = [];
  private cofactors: FlBioNetworkD3Cofactor[] = [];
  private links: FlBioNetworkD3Link[] = [];

  constructor(private grey: string) {
  }


  public convertPathwayToChartPathway(network: FlBioNetwork, selectedPathways: string[],
                                      pathwayDatabase: FlPathwayDatabase): FlBioxNetworkD3 {

    // set the reactions
    this.initReactionsNodes(network.reactions, selectedPathways, pathwayDatabase);

    // create the metabolites nodes form the reactions
    this.initMetabolitesNodes(network.metabolites);

    // create the links from the reactions
    this.initLinks();

    return new FlBioxNetworkD3(this.metabolites, this.reactions, this.cofactors, this.links);
  }

  /**
   * return the reactions nodes from the filterPathway using a specific database
   */
  private initReactionsNodes(reactions: FlBioNetworkReaction[], selectedPathways: string[],
                             pathwayDatabase: FlPathwayDatabase)
    : void {
    const reactionNodes: FlBioNetworkD3Reaction[] = [];

    for (const reaction of reactions) {
      // if there is no filter, return all the reaction
      if (ClHelpService.isNullOrEmpty(selectedPathways) ||
        // or the reaction is in one of the filter pathway
        FlBioNetworkHelper.reactionIsInAnyPathway(reaction, selectedPathways, pathwayDatabase)) {
        // add the reaction
        reactionNodes.push(new FlBioNetworkD3Reaction(reaction.id,
          reaction.name ? reaction.name : reaction.id,
          this.grey, ClHelpService.deepClone(reaction)
        ));
      }
    }

    this.reactions = reactionNodes;
  }

  /**
   * return only the metabolites node included in the reactions
   */
  private initMetabolitesNodes(metabolites: FlBioNetworkMetabolite[])
    : void {


    for (const reaction of this.reactions) {

      // loop on the metabolites included in the reaction
      for (const metaboliteId of Object.keys(reaction.data.metabolites)) {
        // find the metabolite in the list
        const metabolite: FlBioNetworkMetabolite = metabolites.find(metabolite => metabolite.id === metaboliteId);


        if (metabolite == null) {
          console.error('Could find metabolite with id ' + metaboliteId + 'used in reaction ' + reaction.id);
          continue;
        }

        // if the metabolite is a cofactor, we create a new node for each metabolite reaction
        // it prevent theses cofactor metabolites to be linked to a lot of reactions
        if (this.isCofactor(metabolite.chebi_id)) {
          // get and update the cofactor count
          const id = (this.cofactorsCount[metabolite.chebi_id] ?? 0) + 1;
          this.cofactorsCount[metabolite.chebi_id] = id;
          // change the metabolite id to create a separate node
          const newId: string = metaboliteId + ':' + id;

          // replace the id in the reaction
          reaction.data.metabolites[newId] = reaction.data.metabolites[metaboliteId];
          delete reaction.data.metabolites[metaboliteId];

          // create a new object with the new created id
          const newMetabolite = Object.assign(ClHelpService.deepClone(metabolite), {id: newId});
          this.cofactors.push(new FlBioNetworkD3Cofactor(newMetabolite.id,
            newMetabolite.name ? newMetabolite.name : newMetabolite.id,
            newMetabolite
          ));
          continue;
        }


        // add the metabolites to the list if it is not already added
        if (this.metabolites.findIndex(node => node.id === metaboliteId) === -1) {
          this.metabolites.push(new FlBioNetworkD3Metabolite(metabolite.id,
            metabolite.name ? metabolite.name : metabolite.id,
            this.getMetaboliteColor(metabolite),
            metabolite
          ));
        }
      }
    }
  }

  // create the pathway link from list of reaction nodes
  private initLinks(): void {

    const links: FlBioNetworkD3Link[] = [];
    for (const reactionNode of this.reactions) {
      const reaction: FlBioNetworkReaction = reactionNode.data;
      for (const metaboliteId of Object.keys(reaction.metabolites)) {
        // get the estimate with a default value if it doesn't exists
        const estimate: FlBioNetworkReactionEstimate = FlBioNetworkHelper.getReactionEstimate(reaction);
        const reactionDirection: number = reaction.metabolites[metaboliteId] * estimate.value;

        // right side of the link
        if (reactionDirection > 0) {
          links.push(new FlBioNetworkD3Link(reaction.id, metaboliteId, estimate));
        }
        // left side of the link
        else {
          links.push(new FlBioNetworkD3Link(metaboliteId, reaction.id, estimate));
        }
      }
    }

    this.links = links;
  }


  private getMetaboliteColor(metabolite: FlBioNetworkMetabolite): string {
    return flBioNetworkGetCompartmentColor(metabolite.compartment);
  }

  private isCofactor(chebiId: string): boolean {
    return chebiId != null && flBioNetworkCofactor[chebiId] != null;
  }

}
