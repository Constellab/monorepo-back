import {DateTime} from 'luxon';
import {ClDateHelper} from '../utils/cl-date.helper';
import {Transform} from 'class-transformer';
import {ClTransformFnParams} from './cl-json.converter';


/**
 * Transform decorator for luxon date
 * Deserialization --> create date from string
 * Serialization --> return date time
 */
// export function ClLuxonTransform(): PropertyDecorator {
//   // convert date to time
//   const transformToPlain = Transform(
//     (params: ClTransformFnParams<DateTime>) => {
//       console.log('To plain')
//       return params.value?.valueOf() ?? null;
//     },
//     {toPlainOnly: true});
//
//   // create date from string
//   const transformToClass = Transform(
//     (params: ClTransformFnParams<string | null>) => params.value == null ? null : ClDateHelper.getDate(params.value),
//     {toClassOnly: true});
//
//   return (target: any, key: string): void => {
//     transformToPlain(target, key);
//     transformToClass(target, key);
//   };
// }

/**
 * Transform decorator for luxon date
 * Deserialization --> create date from string
 * Serialization --> return day iso yyyy-LL-dd
 */
export function ClLuxonDateTransform(): PropertyDecorator {
  // convert date to time
  const transformToPlain = Transform(
    (params: ClTransformFnParams<DateTime>): string => ClDateHelper.serializeDate(params.value),
    {toPlainOnly: true});

  // convert 'YYYY-MM-DD' to Date
  const transformToClass = Transform(
    (params: ClTransformFnParams<string>): DateTime => ClDateHelper.deserializeDate(params.value),
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
    (params: ClTransformFnParams<DateTime>): string => ClDateHelper.serializeDateTime(params.value),
    {toPlainOnly: true});

  // convert ISO to DateTime
  const transformToClass = Transform(
    (params: ClTransformFnParams<string>): DateTime => ClDateHelper.deserializeDateTime(params.value),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}
