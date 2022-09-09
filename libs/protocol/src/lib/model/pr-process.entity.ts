import {FlStatus, FlStatusDict, FlStatusHelper} from '@monorepo/front-core-lib';
import {PrIO} from './pr-io.class';
import {PrConfig} from './pr-config.entity';
import {
  LabProcessStatus
} from '../../../../../apps/lab-front/src/app/lab-core/model/entities/process/lab-process.entity';


export type PrProcessStatus = 'DRAFT' | 'RUNNING' | 'SUCCESS' | 'ERROR';


export const prProcessStatusDict: FlStatusDict<LabProcessStatus> = {
  DRAFT: FlStatusHelper.getDraftStatus('DRAFT'),
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
};

/**
 * Task or protocol inside a flow
 */
export interface PrProcess {

  id: string;

  name: string;

  processTypingName: string;

  humanName: string;

  status: FlStatus<PrProcessStatus>;

  config: PrConfig;

  inputs: Record<string, PrIO>;

  outputs: Record<string, PrIO>;

  parentProtocolId: string;
}
