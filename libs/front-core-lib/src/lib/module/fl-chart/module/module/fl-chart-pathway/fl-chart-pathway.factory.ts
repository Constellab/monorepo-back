import {FlChartPathwayData, FlChartPathwayLink, FlChartPathwayNode, FlPathway, FlPathwayMetabolites} from './model/fl-pathway.class';
import {FlColorHelper} from '../../../../../utils/fl-color-helper.class';

export class FlChartPathwayFactory {

  public static convertPathwayToChartPathway(pathway: FlPathway, defaultColor: string): FlChartPathwayData {
    const data: FlChartPathwayData = new FlChartPathwayData();

    // create the metabolites nodes
    for (const metabolite of pathway.metabolites) {
      data.metabolites.push(
        new FlChartPathwayNode(metabolite.id,
          metabolite.name ? metabolite.name : metabolite.id,
          'metabolite',
          this.getMetaboliteColor(metabolite, defaultColor),
          metabolite
        ));
    }

    // create the reactions nodes
    for (const reaction of pathway.reactions) {
      data.reactions.push(new FlChartPathwayNode(reaction.id,
        reaction.name ? reaction.name : reaction.id, 'reaction',
        defaultColor,
        reaction
      ));
    }

    // create the links
    for (const reaction of pathway.reactions) {
      for (const metaboliteId of Object.keys(reaction.metabolites)) {
        const reactionDirection: number = reaction.metabolites[metaboliteId] * reaction.estimate.value;

        // right side of the link
        if (reactionDirection > 0) {
          data.links.push(new FlChartPathwayLink(reaction.id, metaboliteId, reaction.estimate));
        }
        // left side of the link
        else {
          data.links.push(new FlChartPathwayLink(metaboliteId, reaction.id, reaction.estimate));
        }
      }
    }

    return data;
  }

  private static getMetaboliteColor(metabolite: FlPathwayMetabolites, defaultColor: string): string {
    return metabolite.compartment ?
      // as the compartment is a single letter, we duplicate it to have really different colors
      FlColorHelper.stringToRGBColor(metabolite.compartment + metabolite.compartment +
        metabolite.compartment + metabolite.compartment) :
      defaultColor;
  }

}
