import {BioxConfig} from '../biox-config.entity';
import {ClRecordTransform} from '@monorepo/core-lib';
import {BioxNode} from '../../global/biox-connection.class';
import {Expose, Type} from 'class-transformer';
import {BioxIO} from '../biox-io.entity';
import {BioxProgressBar} from '../biox-progress-bar.entity';
import {FlGetStatusClassColorFunction, FlGetStatusIconFunction, FlStatus} from '@monorepo/front-core-lib';
import {bioxTaskSourceTypingName} from '../biox_typing_name.py';

export interface BioxProcessData {
  title: string;

  description?: string;

  doc?: string;

  graph?: any;
}

export type BioxProcessStatus = 'DRAFT' | 'RUNNING' | 'SUCCESS' | 'ERROR';

/**
 * Task or protocol inside a flow
 */
export class BioxProcess extends BioxNode implements FlStatus {

  @Expose({name: 'process_typing_name'})
  processTypingName: string;

  data: BioxProcessData;

  experiment: {
    uri: string;
  };

  protocol: {
    uri: string;
  };

  status: BioxProcessStatus;


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

  getStatusClassColor(mode: 'background' | 'text'): string {
    return getBioxProcessStatusColorClass(this.getStatusName(), mode);
  }

  getStatusIcon(): string {
    return getBioxProcessStatusStatusIcon(this.getStatusName());
  }

  getStatusName(): string {
    return this.status;
  }

  // return true if the process is a of type Source
  isSource(): boolean {
    return this.processTypingName === bioxTaskSourceTypingName;
  }

  get title(): string {
    return this.data.title || this.name;
  }
}

const getBioxProcessStatusColorClass: FlGetStatusClassColorFunction = (status: BioxProcessStatus,
                                                                       mode: 'background' | 'text' = 'background'): string => {
  switch (status) {
    case 'ERROR':
      return mode === 'background' ? 'g-warn-background' : 'g-warn-text';
    case 'DRAFT':
      return mode === 'background' ? 'g-grey-background' : 'g-grey-text';
    default:
      return mode === 'background' ? 'g-primary-background' : 'g-primary-text';
  }
};

const getBioxProcessStatusStatusIcon: FlGetStatusIconFunction = (status: BioxProcessStatus): string => {
  switch (status) {
    case 'DRAFT':
      return 'hourglass_empty';
    case 'ERROR':
      return 'error';
    case 'SUCCESS':
      return 'done';
    case 'RUNNING':
      return 'cached';
  }
};
