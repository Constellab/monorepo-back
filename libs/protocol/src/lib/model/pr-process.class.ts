import {FlStatus, FlStatusDict, FlStatusHelper} from '@monorepo/front-core-lib';
import {PrIO} from './pr-io.class';
import {PrConfig} from './pr-config.class';

export type PrProcessStatus = 'DRAFT' | 'RUNNING' | 'SUCCESS' | 'ERROR';


export const prProcessStatusDict: FlStatusDict<PrProcessStatus> = {
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

  instanceName: string;

  processTypingName: string;

  title: string;

  status: FlStatus<PrProcessStatus>;

  config: PrConfig;

  inputs: Record<string, PrIO>;

  outputs: Record<string, PrIO>;

  parentProtocolId: string;
}
