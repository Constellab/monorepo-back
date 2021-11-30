import {Transform} from 'class-transformer';
import {ClTransformFnParams} from '@monorepo/core-lib';

/**
 * Transformer to transform a string to json object for deserialization
 * and json object to string for serialization
 */
export function ClJSONParserTransform(): PropertyDecorator {
  // convert date to time
  const transformToPlain = Transform(
    (param: ClTransformFnParams<Record<any, any>>) => JSON.stringify(param.value),
    {toPlainOnly: true});

  const transformToClass: PropertyDecorator = Transform(
    (param: ClTransformFnParams<string>): any => JSON.parse(param.value),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}
