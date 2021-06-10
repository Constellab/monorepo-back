import {ascending, quantile} from 'd3';

export interface FlChartBoxPlotData {
  q1: number;
  median: number;
  q3: number;
  min: number;
  max: number;
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
  const min = q1 - 1.5 * interQuantileRange;
  const max = q1 + 1.5 * interQuantileRange;

  return {
    q1: q1,
    median: median,
    q3: q3,
    min: min,
    max: max
  };
}


