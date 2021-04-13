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

  getDomainFromNumeric(data: Numeric[]): [Numeric, Numeric] {
    return extent(data, (data) => data);
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
