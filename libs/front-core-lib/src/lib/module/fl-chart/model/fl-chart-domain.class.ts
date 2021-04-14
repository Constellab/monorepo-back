import {extent, Numeric} from 'd3';

/**
 * Object to get the domain based on a list of values
 */
export abstract class FlChartDomain {

  /**
   * Get the domain based on list of converted numeric
   * @param data
   */
  public abstract getDomainFromNumeric(data: Numeric[]): Numeric[];

  /**
   * Get the domain based on list of object and a accessor to access the Numeric value
   * @param data
   * @param accessor
   */
  public getDomain<T>(data: T[], accessor: (datum: T, index: number, array: Iterable<T>) => Numeric): Numeric[] {
    return this.getDomainFromNumeric(data.map((d: T, index: number) => accessor(d, index, data)));
  }
}

/**
 * Linear domain, it returns the min and max value of the data
 */
export class FlChartDomainLinear extends FlChartDomain {

  /**
   * @param extendDomain if set, the domain is extended
   *                     useful for the X domain where values are 0,1,2,3...
   */
  constructor(private extendDomain: number = 0) {
    super();
  }

  getDomainFromNumeric(data: Numeric[]): [Numeric, Numeric] {
    const domain: [Numeric, Numeric] = extent(data, (data) => data);

    if (this.extendDomain !== 0) {
      return [domain[0].valueOf() - this.extendDomain, domain[1].valueOf() + this.extendDomain];
    }
    return domain;
  }

  getDomain<T>(data: T[], accessor: (datum: T, index: number, array: Iterable<T>) => Numeric): [Numeric, Numeric] {
    return super.getDomain(data, accessor) as [Numeric, Numeric];
  }
}

/**
 * Complete domain, returns all the value of the data
 */
export class FlChartDomainComplete extends FlChartDomain {

  getDomainFromNumeric(data: Numeric[]): Numeric[] {
    // return all the data without duplicate
    return [...new Set(data)];
  }

}
