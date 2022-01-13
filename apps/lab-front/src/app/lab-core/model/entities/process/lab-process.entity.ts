import {LabConfig} from '../lab-config.entity';
import {ClRecordTransform} from '@monorepo/core-lib';
import {LabNode} from '../../global/lab-connection.class';
import {Expose, Type} from 'class-transformer';
import {LabIO} from '../lab-io.entity';
import {LabProgressBar} from '../lab-progress-bar.entity';
import {FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';
import {LabTypingName} from '../lab-typing-name.class';

export interface LabProcessData {
  title: string;

  description?: string;

  doc?: string;

  graph?: any;
}

export type LabProcessStatus = 'DRAFT' | 'RUNNING' | 'SUCCESS' | 'ERROR';

const labProcessStatusDict: FlStatusDict<LabProcessStatus> = {
  DRAFT: FlStatusHelper.getDraftStatus('DRAFT'),
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
};

/**
 * Task or protocol inside a flow
 */
export class LabProcess extends LabNode {

  @Expose({name: 'process_typing_name'})
  processTypingName: string;

  data: LabProcessData;

  @Expose({name: 'experiment_id'})
  experimentId: string;

  @Expose({name: 'protocol_id'})
  protocolId: string;

  @FlStatusTransform(labProcessStatusDict)
  status: FlStatus<LabProcessStatus>;


  @Type(() => LabConfig)
  config: LabConfig;

  @Expose({name: 'instance_name'})
  name: string;

  @ClRecordTransform(LabIO)
  inputs: Record<string, LabIO>;

  @ClRecordTransform(LabIO)
  outputs: Record<string, LabIO>;

  @Expose({name: 'progress_bar'})
  @Type(() => LabProgressBar)
  progressBar: LabProgressBar;

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @Expose({name: 'is_deleted'})
  isDeleted: boolean;

  @Expose({name: 'is_protocol'})
  isProtocol: boolean;


  public hasConfig(): boolean {
    return this.config?.data.specs.hasProperties() ?? false;
  }


  // return true if the process is of type Source
  isSource(): boolean {
    return this.processTypingName === LabTypingName.task.source;
  }

  get title(): string {
    return this.data.title || this.name;
  }
}
