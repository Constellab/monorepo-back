import {BioxConfig} from '../biox-config.entity';
import {ClRecordTransform} from '@monorepo/core-lib';
import {BioxNode} from '../../global/biox-connection.class';
import {Expose, Type} from 'class-transformer';
import {BioxIO} from '../biox-io.entity';
import {BioxProgressBar} from '../biox-progress-bar.entity';
import {FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';
import {bioxTaskSourceTypingName} from '../biox-typing-name.py';

export interface BioxProcessData {
  title: string;

  description?: string;

  doc?: string;

  graph?: any;
}

export type BioxProcessStatus = 'DRAFT' | 'RUNNING' | 'SUCCESS' | 'ERROR';

const bioxProcessStatusDict: FlStatusDict<BioxProcessStatus> = {
  DRAFT: FlStatusHelper.getDraftStatus('DRAFT'),
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
};

/**
 * Task or protocol inside a flow
 */
export class BioxProcess extends BioxNode {

  @Expose({name: 'process_typing_name'})
  processTypingName: string;

  data: BioxProcessData;

  experiment: {
    id: string;
  };

  protocol: {
    id: string;
  };

  @FlStatusTransform(bioxProcessStatusDict)
  status: FlStatus<BioxProcessStatus>;


  @Type(() => BioxConfig)
  config: BioxConfig;

  @Expose({name: 'instance_name'})
  name: string;

  @ClRecordTransform(BioxIO)
  inputs: Record<string, BioxIO>;

  @ClRecordTransform(BioxIO)
  outputs: Record<string, BioxIO>;

  @Expose({name: 'progress_bar'})
  @Type(() => BioxProgressBar)
  progressBar: BioxProgressBar;

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @Expose({name: 'is_deleted'})
  isDeleted: boolean;

  @Expose({name: 'is_protocol'})
  isProtocol: boolean;


  public hasConfig(): boolean {
    return this.config?.data.specs.hasProperties() ?? false;
  }


  // return true if the process is a of type Source
  isSource(): boolean {
    return this.processTypingName === bioxTaskSourceTypingName;
  }

  get title(): string {
    return this.data.title || this.name;
  }
}
