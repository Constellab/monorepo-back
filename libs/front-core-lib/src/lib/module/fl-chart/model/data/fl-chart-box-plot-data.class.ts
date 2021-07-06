import {ascending, quantile} from 'd3';
import {FlChartSerie} from './fl-chart-serie.class';

export interface FlChartBoxPlotData {
  q1: number;
  median: number;
  q3: number;
  lowerWhisker: number;
  upperWhisker: number;
  min: number;
  max: number;
  nbOfData: number;
}

/**
 * Specific serie type for the box plot
 */
export class FlChartBoxPlotSerie extends FlChartSerie<number> {

  constructor(public boxPlotData: FlChartBoxPlotData, serieName: string) {
    // we set an array of number as data to have a correct domain
    super([boxPlotData.q1, boxPlotData.median, boxPlotData.q3, boxPlotData.min, boxPlotData.max],
      serieName
    );
  }


}

/**
 * returns the box plot informations for a list of number
 * @param data
 */
export function flChartGetBoxPlotData(data: number[]): FlChartBoxPlotData {
  const sortedData: number[] = data.sort(ascending);

  const q1 = quantile(sortedData, .25);
  const median = quantile(sortedData, .5);
  const q3 = quantile(sortedData, .75);
  const interQuantileRange = q3 - q1;
  const lowerWhisker = q1 - 1.5 * interQuantileRange;
  const upperWhisker = q3 + 1.5 * interQuantileRange;
  const min = data[0];
  const max = data[sortedData.length - 1];

  return {
    q1: q1,
    median: median,
    q3: q3,
    lowerWhisker: lowerWhisker,
    upperWhisker: upperWhisker,
    min: min,
    max: max,
    nbOfData: data.length
  };
}

