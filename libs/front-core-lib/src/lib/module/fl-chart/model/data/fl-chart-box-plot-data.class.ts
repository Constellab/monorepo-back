import {ascending, quantile} from 'd3';
import {FlChartSerie} from './fl-chart-serie.class';
import {FlChartData} from './fl-chart-data.class';

export interface FlChartBoxPlotData extends FlChartData {
  q1: number;
  median: number;
  q3: number;
  lowerWhisker: number;
  upperWhisker: number;
  min: number;
  max: number;
  // nbOfData: number;
}

/**
 * Specific serie type for the box plot
 */
export class FlChartBoxPlotSerie extends FlChartSerie<FlChartBoxPlotData> {

  constructor(boxPlotData: FlChartBoxPlotData[], serieName: string) {
    // we set an array of number as data to have a correct domain
    super(boxPlotData, serieName);
  }


}

/**
 * returns the box plot information for a list of number
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
    valid: true,
    // nbOfData: data.length
  };
}

