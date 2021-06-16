import {FlPathway, FlPathwayDatabase, FlPathwayMetabolite, FlPathwayReaction, FlPathwayReactionEstimate} from '../model/fl-pathway.class';
import {FlColorHelper} from '../../../../../../utils/fl-color-helper.class';
import {
  FlChartPathwayData,
  FlChartPathwayLink,
  FlChartPathwayMetaboliteNode,
  FlChartPathwayNode,
  FlChartPathwayReactionNode
} from '../model/fl-chart-pathway.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlPathwayHelper} from './fl-pathway.helper';

export class FlChartPathwayFactory {

  public static convertPathwayToChartPathway(pathway: FlPathway, filterPathway: string[], pathwayDatabase: FlPathwayDatabase,
                                             defaultColor: string): FlChartPathwayData {
    const data: FlChartPathwayData = new FlChartPathwayData();

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
  private static getReactionNodes(reactions: FlPathwayReaction[], filterPathway: string[],
                                  pathwayDatabase: FlPathwayDatabase, defaultColor: string)
    : FlChartPathwayReactionNode[] {
    const reactionNodes: FlChartPathwayReactionNode[] = [];

    for (const reaction of reactions) {
      // if there is no filter, return all the reaction
      if (ClHelpService.isNullOrEmpty(filterPathway) ||
        // or the reaction is in one of the filter pathway
        FlPathwayHelper.reactionIsInAnyPathway(reaction, filterPathway, pathwayDatabase)) {
        // add the reaction
        reactionNodes.push(new FlChartPathwayReactionNode(reaction.id,
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
  private static getMetabolitesNodes(metabolites: FlPathwayMetabolite[],
                                     reactions: FlChartPathwayReactionNode[],
                                     defaultColor: string)
    : FlChartPathwayMetaboliteNode[] {

    const metaboliteNodes: FlChartPathwayMetaboliteNode[] = [];

    for (const reaction of reactions) {

      // loop on the metabolites included in the reaction
      for (const metaboliteId of Object.keys(reaction.data.metabolites)) {

        // add the metabolites to the list if it is not already added
        if (metaboliteNodes.findIndex(node => node.id === metaboliteId) === -1) {

          // find the metabolite in the list
          const metabolite: FlPathwayMetabolite = metabolites.find(metabolite => metabolite.id === metaboliteId);

          if (metabolite == null) {
            console.error('Could find metabolite with id ' + metaboliteId + 'used in reaction ' + reaction.id);
            continue;
          }

          // create a node and add it
          metaboliteNodes.push(new FlChartPathwayMetaboliteNode(metabolite.id,
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
  private static getLinks(reactionNodes: FlChartPathwayReactionNode[]): FlChartPathwayLink<FlChartPathwayNode>[] {

    const links: FlChartPathwayLink<FlChartPathwayNode>[] = [];
    for (const reactionNode of reactionNodes) {
      const reaction: FlPathwayReaction = reactionNode.data;
      for (const metaboliteId of Object.keys(reaction.metabolites)) {
        // get the estimate with a default value if it doesn't exists
        const estimate: FlPathwayReactionEstimate = FlPathwayHelper.getReactionEstimate(reaction);
        const reactionDirection: number = reaction.metabolites[metaboliteId] * estimate.value;

        // right side of the link
        if (reactionDirection > 0) {
          links.push(new FlChartPathwayLink(reaction.id, metaboliteId, estimate));
        }
        // left side of the link
        else {
          links.push(new FlChartPathwayLink(metaboliteId, reaction.id, estimate));
        }
      }
    }

    return links;
  }


  private static getMetaboliteColor(metabolite: FlPathwayMetabolite, defaultColor: string): string {
    return metabolite.compartment ?
      // as the compartment is a single letter, we duplicate it to have really different colors
      FlColorHelper.stringToRGBColor(metabolite.compartment + metabolite.compartment +
        metabolite.compartment + metabolite.compartment) :
      defaultColor;
  }

}
