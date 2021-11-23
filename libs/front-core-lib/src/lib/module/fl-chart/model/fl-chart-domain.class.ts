import {extent} from 'd3';

/**
 * Object to get the domain based on a list of values
 */
export class FlChartDomain {

  /**
   * @param data
   * @param extendDomain if set, the domain is extended
   *                     useful for the X domain where values are 0,1,2,3...
   * @param minValue if provided, the min domain value will be equal or lower than min value
   * @param maxValue if provided, the min domain value will be equal or higher than max value
   */
  public static getLinearDomain(data: number[], extendDomain: number = 0, minValue?: number, maxValue?: number): [number, number] {
    const domain: [number, number] = extent(data, (data) => data);

    if (domain[1] == null) {
      domain[1] = domain[0];
    }

    if (minValue != null) {
      domain[0] = Math.min(domain[0], minValue);
    }

    if (maxValue != null) {
      domain[1] = Math.max(domain[1], maxValue);
    }

    if (extendDomain !== 0) {
      domain[0] -= extendDomain;
      domain[1] += extendDomain;
    }
    return domain;
  }

  public static getCompleteDomain(data: number[]): number[] {
    // return all the data without duplicate
    return [...new Set(data)].sort((a, b) => a - b);
  }

  // return indexes of complete domain
  public static getCompleteDomainIndex(length: number): number[] {
    // fill the array with number from 0 to N
    return [...Array(length).keys()];
  }
}
