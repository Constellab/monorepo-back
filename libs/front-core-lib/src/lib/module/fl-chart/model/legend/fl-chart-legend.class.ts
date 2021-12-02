import {Selection} from 'd3-selection';

/**
 * Class responsible for drawing the d3 chart legend
 */
export abstract class FlChartLegend {

  protected constructor() {
  }

  public abstract renderLegend(parent: Selection<any, any, any, any>, width: number,
                               height: number): void;

}
