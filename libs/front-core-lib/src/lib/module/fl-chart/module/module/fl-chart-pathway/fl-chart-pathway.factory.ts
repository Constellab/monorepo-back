import {FlChartPathwayData, FlChartPathwayLink, FlChartPathwayNode, FlPathway} from './model/fl-pathway.class';
import {FlColorHelper} from '../../../../../utils/fl-color-helper.class';

export class FlChartPathwayFactory {

  public static convertPathwayToChartPathway(pathway: FlPathway, defaultColor: string): FlChartPathwayData {
    const data: FlChartPathwayData = {
      metabolites: [],
      reactions: [],
      links: []
    };

    // create the metabolites nodes
    for (const metabolite of pathway.metabolites) {
      const color: string = metabolite.compartment ?
        FlColorHelper.stringToRGBColor(metabolite.compartment) : defaultColor;


      data.metabolites.push(
        new FlChartPathwayNode(metabolite.id,
          metabolite.name ? metabolite.name : metabolite.id,
          'metabolite',
          color
        ));
    }

    // create the reactions nodes
    for (const reaction of pathway.reactions) {
      data.reactions.push(new FlChartPathwayNode(reaction.id,
        reaction.name ? reaction.name : reaction.id, 'reaction',
        defaultColor
      ));
    }

    // create the links
    for (const reaction of pathway.reactions) {
      for (const metaboliteId of Object.keys(reaction.metabolites)) {
        const reactionValue: number = reaction.metabolites[metaboliteId];

        // right side of the link
        if (reactionValue > 0) {
          data.links.push(new FlChartPathwayLink(reaction.id, metaboliteId, reactionValue));
        }
        // left side of the link
        else {
          data.links.push(new FlChartPathwayLink(metaboliteId, reaction.id, reactionValue));
        }
      }
    }

    return data;
  }

}
