import {LabEntity} from '../global/lab-entity.entity';
import {FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';

export type LabBrickMessageStatus = 'INFO' | 'ERROR'  | 'CRITICAL'| 'WARNING'

const labBrickMessageStatusDict: FlStatusDict<LabBrickMessageStatus> = {
  INFO: FlStatusHelper.getInfoStatus('INFO'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
  CRITICAL: FlStatusHelper.getCriticalStatus('CRITICAL'),
  WARNING: FlStatusHelper.getWarningStatus('WARNING')
};

export class LabBrickMessage {
  message: string;

  @FlStatusTransform(labBrickMessageStatusDict)
  status: FlStatus<LabBrickMessageStatus>;
}

class LabBrickData extends LabEntity {

  @Type(() => LabBrickMessage)
  messages: LabBrickMessage[];

}

export type LabBrickStatus = 'SUCCESS' | 'ERROR' | 'CRITICAL' | 'WARNING'

const labBrickStatusDict: FlStatusDict<LabBrickStatus> = {
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
  CRITICAL: FlStatusHelper.getCriticalStatus('CRITICAL'),
  WARNING: FlStatusHelper.getWarningStatus('WARNING')
};

export class LabBrickEntity extends LabEntity {
  name: string;

  @FlStatusTransform(labBrickStatusDict)
  status: FlStatus<LabBrickStatus>;

  @Type(() => LabBrickData)
  data: LabBrickData;

  hasMessages(): boolean {
    return this.countMessages() > 0;
  }

  countMessages(): number {
    return this.data?.messages.length ?? 0;
  }
}
