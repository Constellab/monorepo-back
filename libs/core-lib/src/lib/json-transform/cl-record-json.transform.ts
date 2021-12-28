import {Transform} from 'class-transformer';
import {
  ClCoreJsonConvert,
  ClDeserializationRef,
  ClDeserializeItem,
  ClSerializeItem,
  ClTransformFnParams
} from './cl-json.converter';
import {ClRecordWrapper} from '../model/cl-record-wrapper.class';


/**
 * Converter decorator for Record Wrapper
 * Deserialization --> create object wrapper with record property
 * Serialization --> return the record property
 *
 * @param wrapperReference class reference for the record wrapper
 * @param recordItemReference class reference for deserialization of an item
 * @constructor
 */
export function ClRecordWrapperTransform<WRAPPER extends ClRecordWrapper<ITEM>, ITEM>(
  wrapperReference: new() => WRAPPER,
  recordItemReference: new() => ITEM): PropertyDecorator {
  // convert date to time
  const transformToPlain = Transform(
    (params: ClTransformFnParams<WRAPPER>) => clSerializeRecordWrapper(params.value, ClCoreJsonConvert.classToPlain),
    {toPlainOnly: true});

  // create date from string
  const transformToClass = Transform(
    (params: ClTransformFnParams<Record<string, any>>) => clDeserializeRecordWrapper(params.value, wrapperReference, recordItemReference),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}

/**
 * Function to serialize a record wrapper. It serializes only the record property
 */
function clSerializeRecordWrapper(recordWrapper: ClRecordWrapper<any>,
                                  serializeItem: ClSerializeItem<any>): Record<string, any> {
  if (recordWrapper == null) {
    return null;
  }

  // serialize only the record
  return clClassToPlainRecord(recordWrapper.record, serializeItem);
}

/**
 * Function to deserialize a record wrapper (class that wrap the record)
 */
export function clDeserializeRecordWrapper<T extends ClRecordWrapper<any>>(record: Record<string, any>,
                                                                           wrapperReference: new() => T,
                                                                           itemReference: new() => any): T {
  if (record == null) {
    return null;
  }

  const result: T = new wrapperReference();
  // deserialize the record
  result.record = clDeserializeRecord(record,
    (item: any) => ClCoreJsonConvert.deserializeObject(item, itemReference));

  return result;
}


/**
 * Converter decorator for Record
 * Deserialization --> create record of object from record
 * Serialization --> return record of any
 *
 * @param recordItemReference class reference for deserialization of an item
 * @constructor
 */
export function ClRecordTransform<T>(recordItemReference: ClDeserializationRef<T>): PropertyDecorator {
  return ClRecordTransformOverride((value: any) => ClCoreJsonConvert.deserializeObject(value, recordItemReference),
    ClCoreJsonConvert.classToPlain);
}

/**
 * Converter decorator for Record
 * Deserialization --> create record of object from record
 * Serialization --> return record of any
 *
 * @param classToPlainItem optional method call for each record property to override serialize
 * @param deserializeItem optional method call for each record property to override deserialize
 * @constructor
 */
export function ClRecordTransformOverride<T>(deserializeItem: ClDeserializeItem<T>,
                                             classToPlainItem: ClSerializeItem<T> = ClCoreJsonConvert.classToPlain): PropertyDecorator {
  // convert date to time
  const transformToPlain = Transform(
    (params: ClTransformFnParams<Record<string, T>>) => clClassToPlainRecord(params.value, classToPlainItem),
    {toPlainOnly: true});

  // create date from string
  const transformToClass = Transform(
    (params: ClTransformFnParams<Record<string, any>>) => clDeserializeRecord(params.value, deserializeItem),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}

function clClassToPlainRecord<T>(record: Record<string, T>,
                                 classToPlainItem: ClSerializeItem<T>): Record<string, any> {
  if (record == null) {
    return null;
  }

  const result: Record<string, any> = {};
  for (const property of Object.keys(record)) {
    result[property] = classToPlainItem(record[property]);
  }

  return result;
}

function clDeserializeRecord<T>(record: Record<string, any>, deserializeItem: ClDeserializeItem<T>): Record<string, T> {
  if (record == null) {
    return null;
  }

  const result: Record<string, T> = {};
  for (const property of Object.keys(record)) {
    result[property] = deserializeItem(record[property]);
  }

  return result;
}


