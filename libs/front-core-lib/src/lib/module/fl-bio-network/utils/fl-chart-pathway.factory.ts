import {
  FlBioNetwork,
  FlBioNetworkMetabolite,
  FlBioNetworkReaction,
  FlBioNetworkReactionEstimate,
  FlPathwayDatabase
} from '../model/fl-bio-network.class';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';
import {
  FlBioNetworkD3Link,
  FlBioNetworkD3Metabolite,
  FlBioNetworkD3Node,
  FlBioNetworkD3Reaction,
  FlBioxNetworkD3
} from '../model/fl-bio-network-d3.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlPathwayHelper} from './fl-pathway.helper';

export class FlChartPathwayFactory {

  public static convertPathwayToChartPathway(pathway: FlBioNetwork, filterPathway: string[], pathwayDatabase: FlPathwayDatabase,
                                             defaultColor: string): FlBioxNetworkD3 {
    const data: FlBioxNetworkD3 = new FlBioxNetworkD3();

    // set the reactions
    data.reactions = FlChartPathwayFactory.getReactionNodes(pathway.reactions, filterPathway, pathwayDatabase, defaultColor);

    // create the metabolites nodes form the reactions
    data.metabolites = FlChartPathwayFactory.getMetabolitesNodes(pathway.metabolites, data.reactions, defaultColor);

    // create the links from the reactions
    data.links = FlChartPathwayFactory.getLinks(data.reactions);


    return data;
  }

  /**
   * return the reactions nodes from the filterPathway using a specific database
   */
  private static getReactionNodes(reactions: FlBioNetworkReaction[], filterPathway: string[],
                                  pathwayDatabase: FlPathwayDatabase, defaultColor: string)
    : FlBioNetworkD3Reaction[] {
    const reactionNodes: FlBioNetworkD3Reaction[] = [];

    for (const reaction of reactions) {
      // if there is no filter, return all the reaction
      if (ClHelpService.isNullOrEmpty(filterPathway) ||
        // or the reaction is in one of the filter pathway
        FlPathwayHelper.reactionIsInAnyPathway(reaction, filterPathway, pathwayDatabase)) {
        // add the reaction
        reactionNodes.push(new FlBioNetworkD3Reaction(reaction.id,
          reaction.name ? reaction.name : reaction.id,
          defaultColor, reaction
        ));
      }
    }

    return reactionNodes;
  }

  /**
   * return only the metabolites node included in the reactions
   */
  private static getMetabolitesNodes(metabolites: FlBioNetworkMetabolite[],
                                     reactions: FlBioNetworkD3Reaction[],
                                     defaultColor: string)
    : FlBioNetworkD3Metabolite[] {

    const metaboliteNodes: FlBioNetworkD3Metabolite[] = [];

    for (const reaction of reactions) {

      // loop on the metabolites included in the reaction
      for (const metaboliteId of Object.keys(reaction.data.metabolites)) {

        // add the metabolites to the list if it is not already added
        if (metaboliteNodes.findIndex(node => node.id === metaboliteId) === -1) {

          // find the metabolite in the list
          const metabolite: FlBioNetworkMetabolite = metabolites.find(metabolite => metabolite.id === metaboliteId);

          if (metabolite == null) {
            console.error('Could find metabolite with id ' + metaboliteId + 'used in reaction ' + reaction.id);
            continue;
          }

          // create a node and add it
          metaboliteNodes.push(new FlBioNetworkD3Metabolite(metabolite.id,
            metabolite.name ? metabolite.name : metabolite.id,
            this.getMetaboliteColor(metabolite, defaultColor),
            metabolite
          ));
        }
      }
    }

    return metaboliteNodes;
  }

  // create the pathway link from list of reaction nodes
  private static getLinks(reactionNodes: FlBioNetworkD3Reaction[]): FlBioNetworkD3Link<FlBioNetworkD3Node>[] {

    const links: FlBioNetworkD3Link<FlBioNetworkD3Node>[] = [];
    for (const reactionNode of reactionNodes) {
      const reaction: FlBioNetworkReaction = reactionNode.data;
      for (const metaboliteId of Object.keys(reaction.metabolites)) {
        // get the estimate with a default value if it doesn't exists
        const estimate: FlBioNetworkReactionEstimate = FlPathwayHelper.getReactionEstimate(reaction);
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

    return links;
  }


  private static getMetaboliteColor(metabolite: FlBioNetworkMetabolite, defaultColor: string): string {
    return metabolite.compartment ?
      // as the compartment is a single letter, we duplicate it to have really different colors
      FlColorHelper.stringToRGBColor(metabolite.compartment + metabolite.compartment +
        metabolite.compartment + metabolite.compartment) :
      defaultColor;
  }

}
