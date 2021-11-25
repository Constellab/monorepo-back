import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {TrackByFunction} from '@angular/core';

/**
 * Class with static method to simplify dev
 */
export class ClHelpService {

  constructor() {
  }

  /**
   * Deep clone an object (doesn't work with cyclic object)
   * @param object object to clone
   */
  public static deepClone<A>(object: A): A {
    return JSON.parse(JSON.stringify(object));
  }


  /**
   * Compare element on ids
   * @param o1 first element
   * @param o2 second element
   */
  public static compareFnIds(o1: any, o2: any): boolean {
    return ClHelpService.compareFn(o1, o2, 'id');
  }

  /**
   * Compare element on field name
   * @param o1 first element
   * @param o2 second element
   * @param fieldName object attribute to compare
   */
  public static compareFn(o1: any, o2: any, fieldName: string = 'id'): boolean {
    if (o1 == null && o2 == null) {
      return true;
    }

    if (o1 == null || o2 == null) {
      return false;
    }
    return o1[fieldName] === o2[fieldName];
  }

  /**
   * Track by id function for NgFor to track by id
   */
  public static trackByIdFunction(): TrackByFunction<{ id: any }> {
    return (index: number, item: { id: string }): string => item.id;
  }

  /**
   * Insert an element into an ordered item when the compareFn function return < 0
   * @param item item to remove
   * @param array array
   * @param order function to compare elements. Inserted when order returns true
   */
  public static insertIntoOrderedArray<T>(item: T, array: T[],
                                          order: (a: T, b: T, index: number) => boolean): void {
    // true if the element has been added in the loop
    let added: boolean = false;

    for (let i = 0; i < array.length; i++) {
      if (order(item, array[i], i)) {
        array.splice(i, 0, item);
        added = true;
        break;
      }
    }
    if (!added) {
      array.push(item);
    }
  }

  /**
   * Remove an element from array
   * @param item item to remove
   * @param array array
   * @param compareFn function to compare elements
   */
  public static removeSingleElementInArray(item: any, array: any[], compareFn: (a: any, b: any) => boolean): void {
    for (let i = 0; i < array.length; i++) {
      if (compareFn(item, array[i])) {
        array.splice(i, 1);
        return;
      }
    }
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
   * Function to convert a string or number value to number
   * @param num number to convert
   * @param defaultValue default value to use if an error happened
   */
  public static convertStringOrNumberToNumber(num: number | string, defaultValue: number = 0): number {
    let convertedNumber: number;
    if (typeof num === 'string') {
      convertedNumber = parseInt(num, 10);
    } else if (typeof num === 'number') {
      convertedNumber = num;
    } else {
      convertedNumber = defaultValue;
    }

    if (isNaN(convertedNumber)) {
      return defaultValue;
    } else {
      return convertedNumber;
    }
  }


  /**
   * Coerces a data-bound value (typically a string) to a boolean.
   *
   * Useful for component input
   *
   * Return true if value is '' or 'true' or true
   */
  public static coerceBooleanOrEmptyProperty(value: any): boolean {
    return value === '' || coerceBooleanProperty(value);
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
   * Return true if the value is null or an empty string or an empty array or 0
   * @param value to check
   */
  public static isNullOrEmpty(value: any): boolean {
    return value == null || ClHelpService.isEmptyArray(value) || ClHelpService.isEmptyString(value) || value === 0;
  }

  /**
   * return a copy of the value without the null values
   */
  public static getNonEmptyProperties(value: any): any {
    if (value == null) {
      return {};
    }

    const copy: any = {};
    for (const key of Object.keys(value)) {
      if (!ClHelpService.isNullOrEmpty(value[key])) {
        copy[key] = value[key];
      }
    }
    return copy;
  }

  /**
   * Sort an array in the alphabetical order
   * @param array array to sort
   * @param getSortableAttribute method to access sortable attribute
   * @param nullMode mode for null values
   */
  public static sortAlphabeticalOrder<T>(array: T[], getSortableAttribute: (item: T) => string,
                                         nullMode: 'nullLast' | 'nullFirst' = 'nullLast'): T[] {
    if (array == null) {
      return null;
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
  public static sortAlphabeticalFunction(a: string, b: string,
                                         nullMode: 'nullLast' | 'nullFirst' = 'nullLast'): number {
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

  /**
   * Stop event immediate propagation
   */
  public static stopEventPropagation(ev: Event): void {
    ev.stopImmediatePropagation();
    ev.preventDefault();
  }

  /**
   * Method to flatten an array
   */
  public static flatArray<T>(array2d: T[][]): T[] {
    const flatArray: T[] = [];
    array2d.forEach(subArray => flatArray.push(...subArray));
    return flatArray;
  }

}
