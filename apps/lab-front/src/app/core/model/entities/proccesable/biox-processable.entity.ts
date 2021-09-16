import {BioxConfig} from '../biox-config.entity';
import {ClRecordTransform} from '@monorepo/core-lib';
import {BioxNode} from '../../global/biox-connection.class';
import {Expose, Type} from 'class-transformer';
import {BioxInput} from '../biox-input.entity';
import {BioxProgressBar, BioxProgressBarStatus} from '../biox-progress-bar.entity';
import {FlStatus} from '@monorepo/front-core-lib';
import {bioxTaskSourceTypingName} from '../biox-process-special-type';

export interface BioxProcessableData {
  title: string;

  description?: string;

  doc?: string;

  graph?: any;
}

/**
 * Task or protocol inside a flow
 */
export class BioxProcessable extends BioxNode implements FlStatus {

  @Expose({name: 'processable_typing_name'})
  processableTypingName: string

  data: BioxProcessableData;

  experiment: {
    uri: string;
  };

  protocol: {
    uri: string;
  };


  @Type(() => BioxConfig)
  config: BioxConfig;

  @Expose({name: 'instance_name'})
  name: string;

  @ClRecordTransform(BioxInput)
  inputs: Record<string, BioxInput>;

  @ClRecordTransform(BioxInput)
  outputs: Record<string, BioxInput>;

  @Expose({name: 'progress_bar'})
  @Type(() => BioxProgressBar)
  progressBar: BioxProgressBar;

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @Expose({name: 'is_deleted'})
  isDeleted: boolean;

  @Expose({name: 'is_protocol'})
  isProtocol: boolean


  public hasConfig(): boolean {
    return this.config?.data.specs.hasProperties() ?? false;
  }

  getStatusClassColor(mode: 'background' | 'text'): string {
    if (this.progressBar == null) {
      return mode === 'background' ? 'g-grey-background' : 'g-grey-text';
    }

    return this.progressBar.getStatusClassColor(mode);
  }

  getStatusIcon(): string {
    return this.progressBar?.getStatusIcon() ?? 'edit';
  }

  getStatusName(): BioxProgressBarStatus {
    return this.progressBar?.getStatusName() ?? 'draft';
  }

// return true if the process is a Source
  isPlugSource(): boolean {
    return this.processableTypingName === bioxTaskSourceTypingName;
  }

  get title(): string{
    return this.data.title || this.name
  }
}
