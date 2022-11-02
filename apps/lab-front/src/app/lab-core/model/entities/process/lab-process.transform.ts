import {ClCoreJsonConvert, ClTransformFnParams} from '@monorepo/core-lib';
import {LabProcess} from './lab-process.entity';
import {LabProtocol} from './lab-protocol.entity';
import {LabTask} from './lab-task.entity';
import {Transform} from 'class-transformer';

/**
 * Method to instantiate the correct process object when getting it from DB
 * @param json
 */
export function labInstantiateProcess(json: any): LabProcess {
  // if this is a resource file
  if (json.is_protocol) {
    return ClCoreJsonConvert.deserializeObject(json, LabProtocol);
  } else {
    return ClCoreJsonConvert.deserializeObject(json, LabTask);
  }
}

export function LabProcessTransform(): PropertyDecorator {
  const transformToPlain = Transform(
    (params: ClTransformFnParams) => ClCoreJsonConvert.instanceToPlain(params.value),
    {toPlainOnly: true});

  const transformToClass = Transform(
    (params: ClTransformFnParams) => labInstantiateProcess(params.value),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}
