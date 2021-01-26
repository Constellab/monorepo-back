import {Transform} from 'class-transformer';
import {ClCoreJsonConvert, ClDeserializeItem, ClSerializeItem} from './cl-json.converter';


/**
 * Converter decorator for Record
 * Deserialization --> create record of object from record
 * Serialization --> return record of any
 *
 * @param classReference class reference for deserialization
 * @constructor
 */
export function ClRecordTransform<T>(classReference: new() => T): PropertyDecorator {
  return ClRecordTransformOverride((value: any) => ClCoreJsonConvert.deserializeObject(value, classReference),
    ClCoreJsonConvert.serialize);
}

/**
 * Converter decorator for Record
 * Deserialization --> create record of object from record
 * Serialization --> return record of any
 *
 * @param serializeItem optional method call for each record property to override serialize
 * @param deserializeItem optional method call for each record property to override deserialize
 * @constructor
 */
export function ClRecordTransformOverride<T>(deserializeItem: ClDeserializeItem<T>,
                                             serializeItem: ClSerializeItem<T> = ClCoreJsonConvert.serialize): PropertyDecorator {
  // convert date to time
  const transformToPlain = Transform(
    (record: Record<string, T>) => serializeRecord(record, serializeItem),
    {toPlainOnly: true});

  // create date from string
  const transformToClass = Transform(
    (record: Record<string, any>) => deserializeRecord(record, deserializeItem),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}

function serializeRecord<T>(record: Record<string, T>,
                            serializeItem: ClSerializeItem<T>): Record<string, any> {
  if (record == null) {
    return null;
  }

  const result: Record<string, any> = {};
  for (const property of Object.keys(record)) {
    result[property] = serializeItem(record[property]);
  }

  return result;
}

function deserializeRecord<T>(record: Record<string, any>, deserializeItem: ClDeserializeItem<T>): Record<string, T> {
  if (record == null) {
    return null;
  }

  const result: Record<string, T> = {};
  for (const property of Object.keys(record)) {
    result[property] = deserializeItem(record[property]);
  }

  return result;
}

