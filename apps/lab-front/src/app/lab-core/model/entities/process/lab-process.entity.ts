import {LabConfig} from '../lab-config.entity';
import {Expose, Type} from 'class-transformer';
import {LabProgressBar} from '../lab-progress-bar.entity';
import {FlStatus, FlStatusTransform} from '@monorepo/front-core-lib';
import {LabBaseEntityWithUser} from '../lab-user.entity';
import {TdTypingName} from '@monorepo/technical-doc';
import {PrConfigValues, PrIO, PrProcess, prProcessStatusDict} from '@monorepo/protocol';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';

export type LabProcessClass = 'TASK' | 'PROTOCOL';

export interface LabProcessData {
  title: string;

  description?: string;

  graph?: any;
}

export type LabProcessStatus = 'DRAFT' | 'RUNNING' | 'SUCCESS' | 'ERROR';


/**
 * Task or protocol inside a flow
 */
export class LabProcess extends LabBaseEntityWithUser implements PrProcess {

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
  instanceName: string;

  inputs: Record<string, PrIO>;

  outputs: Record<string, PrIO>;

  @Expose({name: 'progress_bar'})
  @Type(() => LabProgressBar)
  progressBar: LabProgressBar;

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @Expose({name: 'is_protocol'})
  isProtocol: boolean;

  @Expose({name: 'brick_version'})
  brickVersion: string;

  @Expose({name: 'started_at'})
  @ClLuxonDateTimeTransform()
  startedAt?: DateTime;

  @Expose({name: 'ended_at'})
  @ClLuxonDateTimeTransform()
  endedAt?: DateTime;




  public hasConfig(): boolean {
    return this.config?.specs.hasProperties() ?? false;
  }

  public updateConfig(config: PrConfigValues): void {
    this.config.updateConfig(config);
  }

  public getConfigValues(): PrConfigValues {
    return this.config.values;
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
    return this.data.title || this.instanceName;
  }

  isFinished(): boolean {
    return this.status.value === 'SUCCESS' || this.status.value === 'ERROR';
  }

  isRunning(): boolean {
    return this.status.value === 'RUNNING';
  }

  getProcessType(): LabProcessClass {
    return this.isProtocol ? 'PROTOCOL' : 'TASK';
  }
}
