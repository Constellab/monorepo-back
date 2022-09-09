import {LabConfig, LabConfigValues} from '../lab-config.entity';
import {Expose, Type} from 'class-transformer';
import {LabProgressBar} from '../lab-progress-bar.entity';
import {FlStatus, FlStatusTransform} from '@monorepo/front-core-lib';
import {LabBaseEntityWithUser} from '../lab-user.entity';
import {TdTypingName} from '@monorepo/technical-doc';
import {PrIO, prProcessStatusDict} from '@monorepo/protocol';

export interface LabProcessData {
  title: string;

  description?: string;

  graph?: any;
}

export type LabProcessStatus = 'DRAFT' | 'RUNNING' | 'SUCCESS' | 'ERROR';


/**
 * Task or protocol inside a flow
 */
export class LabProcess extends LabBaseEntityWithUser {

  @Expose({name: 'process_typing_name'})
  processTypingName: string;

  data: LabProcessData;

  @Expose({name: 'experiment_id'})
  experimentId: string;

  @Expose({name: 'parent_protocol_id'})
  parentProtocolId: string;

  @FlStatusTransform(prProcessStatusDict)
  status: FlStatus<LabProcessStatus>;


  @Type(() => LabConfig)
  config: LabConfig;

  @Expose({name: 'instance_name'})
  name: string;

  inputs: Record<string, PrIO>;

  outputs: Record<string, PrIO>;

  @Expose({name: 'progress_bar'})
  @Type(() => LabProgressBar)
  progressBar: LabProgressBar;

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @Expose({name: 'is_deleted'})
  isDeleted: boolean;

  @Expose({name: 'is_protocol'})
  isProtocol: boolean;

  @Expose({name: 'brick_version'})
  brickVersion: string;


  public hasConfig(): boolean {
    return this.config?.data.specs.hasProperties() ?? false;
  }

  public updateConfig(config: LabConfigValues): void {
    this.config.updateConfig(config);
  }

  public getConfigValues(): LabConfigValues {
    return this.config.data.values;
  }

  // return true if the process is of type Source
  isSource(): boolean {
    return this.processTypingName === TdTypingName.task.source;
  }

  // return true if the process is of type Output
  isOutput(): boolean {
    return this.processTypingName === TdTypingName.task.output.typingName;
  }

  isViewer(): boolean {
    return this.processTypingName === TdTypingName.task.viewer;
  }

  get title(): string {
    return this.data.title || this.name;
  }

  isFinished(): boolean {
    return this.status.value === 'SUCCESS' || this.status.value === 'ERROR';
  }

  isRunning(): boolean {
    return this.status.value === 'RUNNING';
  }
}
