import {extent} from 'd3';

/**
 * Object to get the domain based on a list of values
 */
export class FlChartDomain {

  /**
   * @param data
   * @param extendDomain if set, the domain is extended
   *                     useful for the X domain where values are 0,1,2,3...
   */
  public static getLinearDomain(data: number[], extendDomain: number = 0): [number, number] {
    const domain: [number, number] = extent(data, (data) => data);

    if (domain[1] == null) {
      domain[1] = domain[0];
    }

    if (extendDomain !== 0) {
      return [domain[0] - extendDomain, domain[1] + extendDomain];
    }
    return domain;
  }

  public static getCompleteDomain(data: number[]): number[] {
    // return all the data without duplicate
    return [...new Set(data)];
  }
}
