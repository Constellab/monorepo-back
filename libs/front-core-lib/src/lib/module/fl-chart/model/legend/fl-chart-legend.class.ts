import {Selection} from 'd3-selection';

/**
 * Class responsible for drawing the d3 chart legend in SVG container
 */
export abstract class FlChartSVGLegend {

  protected constructor() {
  }

  public abstract renderLegend(parent: Selection<any, any, any, any>, width: number,
                               height: number): void;

}
