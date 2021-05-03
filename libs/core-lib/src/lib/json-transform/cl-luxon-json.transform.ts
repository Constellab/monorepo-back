import {DateTime} from 'luxon';
import {ClDateHelper} from '../utils/cl-date-helper';
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
