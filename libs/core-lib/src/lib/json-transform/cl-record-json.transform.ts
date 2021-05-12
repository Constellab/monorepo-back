import {Transform} from 'class-transformer';
import {ClCoreJsonConvert, ClDeserializeItem, ClSerializeItem} from './cl-json.converter';
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
    (recordWrapper: WRAPPER) => serializeRecordWrapper(recordWrapper, ClCoreJsonConvert.classToPlain),
    {toPlainOnly: true});

  // create date from string
  const transformToClass = Transform(
    (record: Record<string, any>) => deserializeRecordWrapper(wrapperReference, record,
      (value: any) => ClCoreJsonConvert.deserializeObject(value, recordItemReference)),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}


/**
 * Converter decorator for Record
 * Deserialization --> create record of object from record
 * Serialization --> return record of any
 *
 * @param recordItemReference class reference for deserialization of an item
 * @constructor
 */
export function ClRecordTransform<T>(recordItemReference: new() => T): PropertyDecorator {
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
    (record: Record<string, T>) => classToPlainRecord(record, classToPlainItem),
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

function classToPlainRecord<T>(record: Record<string, T>,
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

/**
 * Function to serialize a record wrapper. It serialize only the record property
 */
function serializeRecordWrapper(recordWrapper: ClRecordWrapper<any>,
                                serializeItem: ClSerializeItem<any>): Record<string, any> {
  if (recordWrapper == null) {
    return null;
  }

  // serialize only the record
  return classToPlainRecord(recordWrapper.record, serializeItem);
}

/**
 * Function to deserialize a record wrapper (class that wrap the record)
 */
function deserializeRecordWrapper<T extends ClRecordWrapper<any>>(wrapperReference: new() => T, record: Record<string, any>,
                                                                  deserializeItem: ClDeserializeItem<any>): T {
  if (record == null) {
    return null;
  }

  const result: T = new wrapperReference();
  // deserialize the record
  result.record = deserializeRecord(record, deserializeItem);

  return result;
}

