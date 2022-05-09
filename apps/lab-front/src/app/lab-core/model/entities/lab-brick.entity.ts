import {LabEntity} from '../global/lab-entity.entity';
import {FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {CmVersion, CmVersionTransform} from '@monorepo/common-model';

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

  version: string;

  @Expose({name: 'repo_type'})
  repoType: 'app'

  @Expose({name: 'repo_commit'})
  repoCommit?: string

  hasMessages(): boolean {
    return this.countMessages() > 0;
  }

  countMessages(): number {
    return this.data?.messages.length ?? 0;
  }
}

/**
 * List of basic gws bricks
 */
export enum LabBrickGWS {
  GWS_CORE = 'gws_core'
}

export class LabBrickMigration{
  @CmVersionTransform()
  version: CmVersion

  @Expose({name: 'short_description'})
  shortDescription: string
}
