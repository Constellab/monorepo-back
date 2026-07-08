/**
 * Class with static method to simplify dev
 */
export class ClHelpService {
  constructor() {}

  /**
   * Deep clone an object (doesn't work with cyclic object)
   * @param object object to clone
   */
  public static deepClone<A>(object: A): A;
  public static deepClone<A>(object: A | null): A | null;
  public static deepClone<A>(object: A | null): A | null {
    if (object == null) return null;
    return JSON.parse(JSON.stringify(object));
  }

  /**
   * Simple method to convert a type 'T | T[]' to 'T[]'
   * @param object object or array
   * @return an array
   */
  public static convertObjectOrArrayToArray<T = any>(object: T | T[]): T[] {
    if (object == null) {
      return [];
    } else if (object instanceof Array) {
      return object;
    } else {
      return [object];
    }
  }

  /**
   * Return true if the value is an array and is empty
   * @param value value to check
   */
  public static isEmptyArray(value: any): boolean {
    return value instanceof Array && value.length === 0;
  }

  /**
   * Return true if the value is a string and is empty
   * @param value value to check
   */
  public static isEmptyString(value: any): boolean {
    return typeof value === 'string' && value.length === 0;
  }

  /**
   * Return true if the value is an object and is empty
   * @param value value to check
   */
  public static isEmptyObject(value: any): boolean {
    return typeof value === 'object' && Object.keys(value).length === 0;
  }

  /**
   * Return true if the value is null or an empty string or an empty array or 0
   * @param value to check
   */
  public static isNullOrEmpty(value: any): boolean {
    return (
      value == null ||
      ClHelpService.isEmptyArray(value) ||
      ClHelpService.isEmptyString(value) ||
      ClHelpService.isEmptyObject(value) ||
      value === 0
    );
  }

  /**
   * Sort an array in the alphabetical order
   * @param array array to sort
   * @param getSortableAttribute method to access sortable attribute
   * @param nullMode mode for null values
   */
  public static sortAlphabeticalOrder<T>(
    array: T[],
    getSortableAttribute?: (item: T) => string,
    nullMode?: 'nullLast' | 'nullFirst'
  ): T[];
  public static sortAlphabeticalOrder<T>(
    array: T[] | null,
    getSortableAttribute?: (item: T) => string,
    nullMode?: 'nullLast' | 'nullFirst'
  ): T[] | null;
  public static sortAlphabeticalOrder<T>(
    array: T[] | null,
    getSortableAttribute?: (item: T) => string,
    nullMode: 'nullLast' | 'nullFirst' = 'nullLast'
  ): T[] | null {
    if (array == null) {
      return null;
    }

    // define a function that simply returns the object
    if (!getSortableAttribute) {
      getSortableAttribute = (a: any) => a;
    }

    return array.sort((a, b) => {
      const aValue = getSortableAttribute(a);
      const bValue = getSortableAttribute(b);

      return ClHelpService.sortAlphabeticalFunction(aValue, bValue, nullMode);
    });
  }

  /**
   * Sort function for alphabetical order
   * @param a string to compare
   * @param b string to compare
   * @param nullMode mode for null values
   */
  public static sortAlphabeticalFunction(
    a: string,
    b: string,
    nullMode: 'nullLast' | 'nullFirst' = 'nullLast'
  ): number {
    const nullValue = nullMode === 'nullLast' ? -1 : 1;

    if (a == null && b == null) {
      return 0;
    } else if (a == null) {
      return -nullValue;
    } else if (b == null) {
      return nullValue;
    } else if (a.toLowerCase() < b.toLowerCase()) {
      return -1;
    } else if (a.toLowerCase() > b.toLowerCase()) {
      return 1;
    }
    return 0;
  }
}
