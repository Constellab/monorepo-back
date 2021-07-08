import {Selection} from 'd3-selection';

/**
 * Class responsible for drawing the d3 chart legend
 */
export abstract class FlChartLegend {

  protected constructor(protected parent: Selection<any, any, any, any>, protected width: number,
                        protected height: number) {
  }

  public abstract renderLegend(): void;

  protected getRangeX(): [number, number]{
    return [0, this.width];
  }

  protected getRangeY(): [number, number]{
    return [0, this.height];
  }
}
