// data holder for the histogram
import {FlChart2dDatum} from './fl-chart-data.class';
import {FlChartDomain} from '../fl-chart-domain.class';

/**
 * Binned data, this is an object that contains multiple value between the min and max values
 *
 * Useful for histogram
 */
export class FlChartDataBin implements FlChart2dDatum {

  constructor(private x: number, private y: number,
              public readonly min: number, public readonly max: number) {
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  addData(): void {
    this.y++;
  }

  public getIntervalText(): string {
    return `[${this.min.toFixed(2)},${this.max.toFixed(2)}]`;
  }
}

/**
 * Build FlChartDataBin from data
 * @param data
 * @param numberOfBins
 */
export function flChartGetDataBins(data: number[], numberOfBins: number): FlChartDataBin[] {
  const domain: [number, number] = FlChartDomain.getLinearDomain(data);

  const bins: FlChartDataBin[] = [];

  // size of the bins (set to 1 if result is 0)
  const thresholds: number = (domain[1] - domain[0]) / numberOfBins || 1;

  // create all the bins
  for (let i = 0; i < numberOfBins; i++) {
    const min = (i * thresholds) + domain[0];
    // for the last bin, use the domain max value
    const max = i === numberOfBins - 1 ? domain[1] : min + thresholds;
    bins.push(new FlChartDataBin(i, 0, min, max));
  }

  // add the data in the right category
  for (const d of data) {
    let index: number = (d - domain[0]) / thresholds;

    // specific condition to prevent index from being
    // outside of array
    if (index >= bins.length) {
      index = bins.length - 1;
    }
    // if the result is an integer, set in previous index to exclude max values from bins
    else if (Number.isInteger(index) && index > 0) {
      index--;
    } else {
      index = Math.trunc(index);
    }

    // add the data to the bin
    bins[index].addData();
  }

  return bins;
}

/**
 * return the default number of bins we can made from the number of data
 * This is the Square root of the number of data round up
 * @param numberOfData
 */
export function flChartGetDefaultNumberOfBins(numberOfData: number = 0): number {
  if (numberOfData <= 0) {
    return 0;
  }
  return Math.ceil(Math.sqrt(numberOfData));
}
