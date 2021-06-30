// data holder for the histogram
import {Numeric} from 'd3';
import {FlChart2dDatum} from './fl-chart-data.class';
import {FlChartDomain} from '../fl-chart-domain.class';

/**
 * Binned data, this is an object that contains multiple value between the min and max values
 *
 * Useful for histogram
 */
export class FlChartDataBin implements FlChart2dDatum {

  constructor(private x: number, private data: number[],
              public readonly min: number, public readonly max: number) {
  }

  getX(): Numeric {
    return this.x;
  }

  getY(): Numeric {
    return this.data.length;
  }

  addData(data: number): void {
    this.data.push(data);
  }

  public getSortedData(): number[] {
    return this.data.sort();
  }

  public getIntervalText(): string {
    return `[${this.min.toFixed(2)} , ${this.max.toFixed(2)}]`;
  }
}

/**
 * Build FlChartDataBin from data
 * @param data
 * @param numberOfBins
 */
// todo change default number of bin default value
export function flChartGetDataBins(data: number[], numberOfBins: number = 5): FlChartDataBin[] {

  const domain: [number, number] = FlChartDomain.getLinearDomain(data);

  const bins: FlChartDataBin[] = [];

  // size of the bins
  const thresholds: number = (domain[1] - domain[0]) / numberOfBins;

  // create all the bins
  for (let i = 0; i < numberOfBins; i++) {
    const min = (i * thresholds) + domain[0];
    // for the last bin, use the domain max value
    const max = i === numberOfBins - 1 ? domain[1] : min + thresholds;
    bins.push(new FlChartDataBin(i, [], min, max));
  }

  // add the data in the right category
  for (const d of data) {
    let index: number = (d - domain[0]) / thresholds;

    // if the result is an integer, set in previous index to exclude max values from bins
    if (Number.isInteger(index) && index > 0) {
      index--;
    } else {
      index = Math.trunc(index);
    }

    // add the data to the bin
    bins[index].addData(d);
  }

  return bins;
}
