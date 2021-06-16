import {ClHelpService} from '@monorepo/core-lib';
import {
  flDefaultPathwayReactionValue,
  flDefaultSubPathway,
  FlPathway,
  FlPathwayDatabase,
  FlPathwayReaction,
  FlPathwayReactionEstimate,
  FlPathwayReactionPathwayDetail,
  flPathwayReactionPathwayIdSeparator
} from '../model/fl-pathway.class';

/**
 * Helper class to manipulate {@link FlPathway}
 */
export class FlPathwayHelper {


  /**
   * return the complete list of sub pathway
   * @param pathway
   * @param database
   */
  public static getSubPathwayList(pathway: FlPathway, database: FlPathwayDatabase): FlPathwayReactionPathwayDetail[] {
    const subPathways: FlPathwayReactionPathwayDetail[] = [];

    for (const reaction of pathway.reactions) {
      // retrieve the sub pathway information
      // if it does not exists, use a default pathway
      const subPathway: FlPathwayReactionPathwayDetail = FlPathwayHelper.getReactionPathway(reaction, database);

      // split the pathway to get all the pathways of this reaction
      const splitPathways: FlPathwayReactionPathwayDetail[] = this.splitReactionPathway(subPathway);

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
  private static splitReactionPathway(subPathway?: FlPathwayReactionPathwayDetail): FlPathwayReactionPathwayDetail[] {
    if (subPathway == null) {
      return [flDefaultSubPathway];
    }

    // if the pathway doesn't have an id, use the name instead
    if (!subPathway.id) {
      return [{
        id: subPathway.name,
        name: subPathway.name
      }];

    }

    // split the ids and names and construct an array with split values
    const ids: string[] = subPathway.id.split(flPathwayReactionPathwayIdSeparator);
    const names: string[] = (subPathway.name ?? '').split(flPathwayReactionPathwayIdSeparator);

    return ids.map((id, index) => {
      return {
        id: id,
        name: names[index] ?? ''
      };
    });
  }

  // retrieve the pathway of a reaction of a specific database
  public static getReactionPathway(reaction: FlPathwayReaction, database: FlPathwayDatabase): FlPathwayReactionPathwayDetail {
    return (reaction.enzyme?.pathway ?? {})[database] ?? flDefaultSubPathway;
  }

  // check if a reaction is in a pathway (of a specific database)
  public static reactionIsInAnyPathway(reaction: FlPathwayReaction, pathwayIds: string[],
                                       database: FlPathwayDatabase): boolean {
    const reactionPathway: FlPathwayReactionPathwayDetail = FlPathwayHelper.getReactionPathway(reaction, database);

    // create an regex with all the ids separated with OR
    const regex: RegExp = new RegExp(pathwayIds.join('|'));

    // if the reaction does not jave an id, check with the name
    if (ClHelpService.isNullOrEmpty(reactionPathway.id)) {
      return regex.test(reactionPathway.name);
    } else {
      return regex.test(reactionPathway.id);
    }
  }

  // return the estimate values of a reaction, with a default value if it doesn't exist
  public static getReactionEstimate(reaction: FlPathwayReaction): FlPathwayReactionEstimate {
    return reaction.estimate ?? flDefaultPathwayReactionValue;
  }
}
