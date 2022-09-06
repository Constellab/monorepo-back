import {FlStatus} from '@monorepo/front-core-lib';
import {PrIO} from './pr-io.class';
import {PrConfig} from './pr-config.entity';


export type PrProcessStatus = 'DRAFT' | 'RUNNING' | 'SUCCESS' | 'ERROR';


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
