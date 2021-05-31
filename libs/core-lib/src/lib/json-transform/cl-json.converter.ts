import {ClHelpService} from '../utils/cl-help.service';
import {classToPlain, plainToClass, serialize} from 'class-transformer';
import {ClClassReference} from '../model/cl-class-reference.class';

/**
 * File for the json to class converter
 * Currently using class-transformer
 */

/**
 * PAram of the transform methods, use form class-transformer v 0.4
 */
// export interface FlTransformFnParams<T = any> {
//   value: T;
//   key: string;
//   obj: any;
//   type: TransformationType;
//   options: ClassTransformOptions;
// }


// type of method to serialize item
export type ClSerializeItem<T> = (object: T) => any;

// type of method to deserialize item
export type ClDeserializeItem<T> = (object: any) => T;

/**
 * Simple function type to create an object
 */
export type ClConstructorFunction<T = any> = (json: any) => T;

/**
 * Type to create object, can be either a class reference of a function to create the object
 */
export type ClDeserializationRef<T = any> = ClClassReference<T> | ClConstructorFunction<T>;

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
   * @param classReference class reference or function to create the object
   */
  public static deserialize<T>(json: any, classReference: ClDeserializationRef<T>): T | T[] {
    // if this is a class reference
    if (classReference.prototype != null) {
      return plainToClass(classReference as ClClassReference, json);
    }
    // if this a a constructor function
    else {
      return (classReference as ClConstructorFunction)(json);
    }
  }

  /**
   * Tries to deserialize a JSON object to a TypeScript object.
   *
   * @param json the JSON object
   * @param classReference class reference or function to create the object
   */
  public static deserializeObject<T>(json: any, classReference: ClDeserializationRef<T>): T {
    return ClCoreJsonConvert.deserialize(json, classReference) as T;
  }

  /**
   * Tries to serialize a TypeScript object or array of objects to JSON.
   *
   * @param data object or array of objects
   */
  public static serialize<T>(data: T | T[]): string {
    return serialize(data);
  }

  /**
   * Tries to serialize a TypeScript object or array of objects to JSON.
   *
   * @param data object or array of objects
   */
  public static classToPlain<T>(data: T | T[]): any | any[] {
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
