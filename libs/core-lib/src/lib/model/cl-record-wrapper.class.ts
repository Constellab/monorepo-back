/**
 * Class to wrap a record and provide method to simplify record management
 *
 * Can by instantiate with {@link ClRecordWrapperTransform}
 */
export class ClRecordWrapper<T> {
  record: Record<string, T>;

  /**
   * count the record values
   */
  public count(): number {
    return Object.keys(this.record ?? {}).length;
  }

  /**
   * return true if the record is empty
   */
  public isEmpty(): boolean {
    return this.count() === 0;
  }

  /**
   * return true if the record is not empty
   */
  public hasProperties(): boolean {
    return this.count() > 0;
  }
}
