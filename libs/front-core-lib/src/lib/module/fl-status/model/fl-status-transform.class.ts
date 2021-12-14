import {Transform} from 'class-transformer';
import {ClTransformFnParams} from '@monorepo/core-lib';
import {FlStatus, FlStatusDict} from './fl-status.class';


/**
 * Transformer to convert a string status to a FlStatus object
 * @param statusList
 * @constructor
 */
export function FlStatusTransform(statusList: FlStatusDict): PropertyDecorator {
  const transformToPlain = Transform(
    (params: ClTransformFnParams<FlStatus>) => params.value?.value ?? null,
    {toPlainOnly: true}
  );

  const transformToClass = Transform(
    (params: ClTransformFnParams<string | null>) => params.value == null ? null : statusList[params.value],
    {toClassOnly: true}
  );

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}
