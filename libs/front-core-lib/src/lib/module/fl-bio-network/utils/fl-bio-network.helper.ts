import {ClHelpService} from '@monorepo/core-lib';
import {
  FlBioNetwork,
  FlBioNetworkPathwayDetail,
  flBioNetworkPathwayIdSeparator,
  FlBioNetworkReaction,
  FlBioNetworkReactionEstimate,
  flDefaultPathway,
  flDefaultPathwayReactionValue,
  FlPathwayDatabase
} from '../model/fl-bio-network.class';

const pathwaySplitChar = '; ';

/**
 * Helper class to manipulate {@link FlBioNetwork}
 */
export class FlBioNetworkHelper {


  /**
   * return the complete list of sub pathway
   * @param pathway
   * @param database
   */
  public static getPathwaysList(pathway: FlBioNetwork, database: FlPathwayDatabase): FlBioNetworkPathwayDetail[] {
    const subPathways: FlBioNetworkPathwayDetail[] = [];

    for (const reaction of pathway.reactions) {
      // retrieve the sub pathway information
      // if it does not exists, use a default pathway
      const subPathway: FlBioNetworkPathwayDetail = FlBioNetworkHelper.getReactionPathway(reaction, database);

      // split the pathway to get all the pathways of this reaction
      const splitPathways: FlBioNetworkPathwayDetail[] = this.splitReactionPathway(subPathway);

      // add all the not existing pathway to the list
      for (const pathway of splitPathways) {
        // if the sub pathway was not already added
        if (subPathways.findIndex(s => s.id === pathway.id) === -1) {
          // insert the sub pathway in alphabetical order
          ClHelpService.insertIntoOrderedArray(pathway, subPathways,
            (p1, p2) => ClHelpService.sortAlphabeticalFunction(p1.name, p2.name) < 0);
        }
      }
    }

    return subPathways;
  }

  /**
   * Split a FlPathwayReactionPathwayDetail into array of FlPathwayReactionPathwayDetail
   * because a basic FlPathwayReactionPathwayDetail contains multiple values
   * @param subPathway
   * @private
   */
  private static splitReactionPathway(subPathway?: FlBioNetworkPathwayDetail): FlBioNetworkPathwayDetail[] {
    if (subPathway == null) {
      return [flDefaultPathway];
    }

    // if the pathway doesn't have an id, use the name instead
    if (!subPathway.id) {
      return [{
        id: subPathway.name,
        name: subPathway.name
      }];

    }

    // split the ids and names and construct an array with split values
    const ids: string[] = subPathway.id.split(flBioNetworkPathwayIdSeparator);
    const names: string[] = (subPathway.name ?? '').split(flBioNetworkPathwayIdSeparator);

    return ids.map((id, index) => {
      return {
        id: id,
        name: names[index] ?? ''
      };
    });
  }

  // retrieve the pathway of a reaction of a specific database
  public static getReactionPathway(reaction: FlBioNetworkReaction, database: FlPathwayDatabase): FlBioNetworkPathwayDetail {
    return (reaction.enzyme?.pathways ?? {})[database] ?? flDefaultPathway;
  }

  // retrieve the list of pathways of a reaction for a database
  public static getReactionPathwayId(reaction: FlBioNetworkReaction, database: FlPathwayDatabase): string[] {
    const pathwayDetail: FlBioNetworkPathwayDetail = FlBioNetworkHelper.getReactionPathway(reaction, database);
    const pathwayIdStr: string = ClHelpService.isNullOrEmpty(pathwayDetail.id) ? pathwayDetail.name : pathwayDetail.id;
    return pathwayIdStr.split(pathwaySplitChar);
  }

  // check if a reaction is in a pathway (of a specific database)
  // if true, it returns the list of pathway in reaction
  public static reactionIsInAnyPathway(reaction: FlBioNetworkReaction, pathwayIds: string[],
                                       database: FlPathwayDatabase): boolean {
    const reactionPathways: string[] = FlBioNetworkHelper.getReactionPathwayId(reaction, database);

    // return only the the reaction pathways that are in the list of pathways
    return reactionPathways.findIndex(id => pathwayIds.indexOf(id) !== -1) !== -1;
  }

  // return the estimate values of a reaction, with a default value if it doesn't exist
  public static getReactionEstimate(reaction: FlBioNetworkReaction): FlBioNetworkReactionEstimate {
    return reaction.estimate ?? flDefaultPathwayReactionValue;
  }
}
