/**
 * File for the json2typescript converter
 */

import {JsonConvert, JsonConverter, JsonCustomConvert, OperationMode, ValueCheckingMode} from 'json2typescript';
import {Moment} from 'moment';
import {DateHelper} from './date-helper';

/**
 * Basic date convert for json2typescript serialisation/deserialization
 */
@JsonConverter
export class DateConverter implements JsonCustomConvert<Date> {
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
 * Basic moment convert for json2typescript serialisation/deserialization
 */
@JsonConverter
export class MomentConverter implements JsonCustomConvert<Moment> {
  serialize(moment: Moment): any {
    if (moment == null) {
      return moment;
    }
    return moment.valueOf();
  }

  deserialize(moment: any): Moment {
    if (!moment) {
      return null;
    }
    return DateHelper.getMoment(moment);
  }
}


/**
 * Simple static class to deserialize and serialize JSON object
 * using json2typescript
 *
 * More detail about json2typescript {@link https://github.com/AppVision-GmbH/json2typescript}
 */
export class CoreJsonConvert {

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
    return CoreJsonConvert.converter.deserialize(json, classReference);
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
    return CoreJsonConvert.converter.deserializeObject(json, classReference);
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
    return CoreJsonConvert.converter.serialize(data);
  }
}
