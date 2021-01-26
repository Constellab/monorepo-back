import {ClHelpService} from '../utils/cl-help-service';
import {classToPlain, plainToClass} from 'class-transformer';

/**
 * File for the json to class converter
 * Currently using class-transformer
 */

// type of method to serialize item
export type ClSerializeItem<T> = (object: T) => any;

// type of method to deserialize item
export type ClDeserializeItem<T> = (object: any) => T;


/**
 * Simple static class to deserialize and serialize JSON object
 * using class transformer
 *
 */
export class ClCoreJsonConvert {

  /**
   * Tries to deserialize given JSON to a TypeScript object or array of objects.
   *
   * @param json the JSON as object or array
   * @param classReference the class reference
   */
  public static deserialize<T>(json: any, classReference: new() => T): T | T[] {
    return plainToClass(classReference, json);
  }

  /**
   * Tries to deserialize a JSON object to a TypeScript object.
   *
   * @param json the JSON object
   * @param classReference the class reference
   */
  public static deserializeObject<T>(json: any, classReference: new() => T): T {
    return plainToClass(classReference, json);
  }

  /**
   * Tries to serialize a TypeScript object or array of objects to JSON.
   *
   * @param data object or array of objects
   */
  public static serialize<T>(data: T | T[]): any | any[] {
    return classToPlain(data);
  }

  /**
   * Deep clone a class object with class-transformer (doesn't work with cyclic object)
   * @param object object to clone
   * @param classReference the class reference
   */
  public static deepCloneClass<A>(object: A, classReference: new() => A): A {
    return ClCoreJsonConvert.deserialize(ClHelpService.deepClone(object), classReference) as A;
  }

  /**
   * Deep clone an array of class object with class-transformer (doesn't work with cyclic object)
   * @param object object to clone
   * @param classReference the class reference
   */
  public static deepCloneClassArray<A>(object: A[], classReference: new() => A): A[] {
    return ClCoreJsonConvert.deserialize(ClHelpService.deepClone(object), classReference) as A[];
  }
}
