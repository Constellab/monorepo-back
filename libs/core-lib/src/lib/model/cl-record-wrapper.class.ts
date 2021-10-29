export interface ClRecordItem<T = any> {
  value: T;
  key: string;
}

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

  public some(predicate: (value: T, key: string) => unknown, thisArg?: any): boolean {
    const array: ClRecordItem<T>[] = this.toArray();

    return array.some((item) => predicate(item.value, item.key), thisArg);
  }

  public toArray(): ClRecordItem<T>[] {
    return Object.entries(this.record).map(([key, value]) => ({value: value, key: key}));
  }
}
