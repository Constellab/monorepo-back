import {Transform, Type} from 'class-transformer';
import {PrProcess} from './pr-process.entity';
import {PrProtocolLink} from './pr-protocol-link.entity';
import {ClCoreJsonConvert, ClTransformFnParams} from '@monorepo/core-lib';
import {PrProtocol} from './pr-protocol.entity';
import {PrTask} from './pr-task.entity';


/**
 * Method to instantiate the correct process object when getting it from DB
 * @param json
 */
export function prInstantiateProcess(json: any): PrProcess {
  // if this is a resource file
  if (json.is_protocol) {
    return ClCoreJsonConvert.deserializeObject(json, PrProtocol);
  } else {
    return ClCoreJsonConvert.deserializeObject(json, PrTask);
  }
}

export function PrProcessTransform(): PropertyDecorator {
  const transformToPlain = Transform(
    (params: ClTransformFnParams) => ClCoreJsonConvert.classToPlain(params.value),
    {toPlainOnly: true});

  const transformToClass = Transform(
    (params: ClTransformFnParams) => prInstantiateProcess(params.value),
    {toClassOnly: true});

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}

export class PrAddProcessWithLink {

  @PrProcessTransform()
  process: PrProcess;

  @Type(() => PrProtocolLink)
  link: PrProtocolLink;
}


/**
 * Object to describe the position of a new node relative to another node (usually because they are linked)
 */
export interface PrNodeRelativeCoord {
  nodeName: string;
  position: 'before' | 'after';
  layerId: string;
}
