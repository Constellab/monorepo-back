import {JsonConvert, JsonConverter, JsonCustomConvert, OperationMode, ValueCheckingMode} from 'json2typescript';
import {ClHelpService} from './cl-help-service';

/**
 * File for the json2typescript converter
 */
/**
 * Basic date convert for json2typescript serialisation/deserialization
 */
@JsonConverter
export class ClDateConverter implements JsonCustomConvert<Date> {
  serialize(date: Date): any {
    if (date == null) {
      return date;
    }
    return date.getTime();
  }

  deserialize(date: any): Date {
    return new Date(date);
  }
}


/**
 * Simple static class to deserialize and serialize JSON object
 * using json2typescript
 *
 * More detail about json2typescript {@link https://github.com/AppVision-GmbH/json2typescript}
 */
export class ClCoreJsonConvert {

  private static readonly converter: JsonConvert = new JsonConvert(OperationMode.ENABLE,
    ValueCheckingMode.ALLOW_NULL);

  /**
   * Tries to deserialize given JSON to a TypeScript object or array of objects.
   *
   * @param json the JSON as object or array
   * @param classReference the class reference
   *
   * @returns the deserialized data (TypeScript instance or array of TypeScript instances)
   *
   * @throws an Error in case of failure
   *
   * @author Andreas Aeschlimann, DHlab, University of Basel, Switzerland
   * @see https://www.npmjs.com/package/json2typescript full documentation
   */
  public static deserialize<T>(json: any, classReference: new() => T): T | T[] {
    return ClCoreJsonConvert.converter.deserialize(json, classReference);
  }

  /**
   * Tries to deserialize a JSON object to a TypeScript object.
   *
   * @param json the JSON object
   * @param classReference the class reference
   *
   * @returns the deserialized TypeScript instance
   *
   * @throws an Error in case of failure
   *
   * @author Andreas Aeschlimann, DHlab, University of Basel, Switzerland
   * @see https://www.npmjs.com/package/json2typescript full documentation
   */
  public static deserializeObject<T>(json: any, classReference: new() => T): T {
    return ClCoreJsonConvert.converter.deserializeObject(json, classReference);
  }

  /**
   * Tries to serialize a TypeScript object or array of objects to JSON.
   *
   * @param data object or array of objects
   *
   * @returns the JSON object
   *
   * @throws an Error in case of failure
   *
   * @author Andreas Aeschlimann, DHlab, University of Basel, Switzerland
   * @see https://www.npmjs.com/package/json2typescript full documentation
   */
  public static serialize<T>(data: T | T[]): any | any[] {
    return ClCoreJsonConvert.converter.serialize(data);
  }

  /**
   * Deep clone a class object with json2typescript (doesn't work with cyclic object)
   * @param object object to clone
   * @param classReference the class reference
   */
  public static deepCloneClass<A>(object: A, classReference: new() => A): A {
    return ClCoreJsonConvert.deserialize(ClHelpService.deepClone(object), classReference) as A;
  }

  /**
   * Deep clone an array of class object with json2typescript (doesn't work with cyclic object)
   * @param object object to clone
   * @param classReference the class reference
   */
  public static deepCloneClassArray<A>(object: A[], classReference: new() => A): A[] {
    return ClCoreJsonConvert.deserialize(ClHelpService.deepClone(object), classReference) as A[];
  }
}
