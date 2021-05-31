import {DateTime} from 'luxon';
import {ClDateHelper} from '../utils/cl-date.helper';
import {Transform} from 'class-transformer';


/**
 * Transform decorator for luxon date
 * Deserialization --> create date from string
 * Serialization --> return date time
 */
export function ClLuxonTransform(): PropertyDecorator {
  // convert date to time
  const transformToPlain = Transform(
    (date: DateTime) => date?.valueOf() ?? null,
    {toPlainOnly: true});

  // create date from string
  const transformToClass = Transform(
    (date: string | null) => date == null ? null : ClDateHelper.getDate(date),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}

/**
 * Transform decorator for luxon date
 * Deserialization --> create date from string
 * Serialization --> return day iso yyyy-LL-dd
 */
export function ClLuxonDateTransform(): PropertyDecorator {
  // convert date to time
  const transformToPlain = Transform(
    (param: DateTime): string => ClDateHelper.serializeDate(param),
    {toPlainOnly: true});

  // convert 'YYYY-MM-DD' to Date
  const transformToClass = Transform(
    (param: string): DateTime => ClDateHelper.deserializeDate(param),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}

/**
 * Transform decorator for luxon date
 * Deserialization --> create date time from string
 * Serialization --> return datetime iso YYYY-MM-DDThh:mm:ssZ
 */
export function ClLuxonDateTimeTransform(): PropertyDecorator {
  // convert dateTime to ISI
  const transformToPlain = Transform(
    (param: DateTime): string => ClDateHelper.serializeDateTime(param),
    {toPlainOnly: true});

  // convert ISO to DateTime
  const transformToClass = Transform(
    (param: string): DateTime => ClDateHelper.deserializeDateTime(param),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}
