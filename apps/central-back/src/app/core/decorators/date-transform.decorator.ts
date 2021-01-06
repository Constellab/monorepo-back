import {Transform} from 'class-transformer';

/**
 * Transform decorator for date
 * Deserialization --> create date from string
 * Serialization --> return date time
 */
export function DateTransform(): PropertyDecorator {
  // convert date to time
  const transformToPlain = Transform(
    (date: Date) => date?.getTime() ?? null,
    {toPlainOnly: true});

  // create date from string
  const transformToClass = Transform(
    (date: string | null) => date == null ? null : new Date(date),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}
