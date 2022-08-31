import {ClRecordTransform} from '@monorepo/core-lib';
import {FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';
import {PrNode} from './pr-connection.class';
import {PrIO} from './pr-io.class';
import {PrTypingName} from './pr-typing-name.class';
import {PrConfig, PrConfigData, PrConfigValues} from './pr-config.entity';
import {PrProtocolGraphInputNode} from './pr-protocol-graph-input.class';
import {PrConfigSpecs} from './pr-config-spec.entity';
import {TdIOSpec} from '@monorepo/technical-doc';

export interface PrProcessData {
  title: string;

  description?: string;

  doc?: string;

  graph?: any;
}

export type PrProcessStatus = 'DRAFT' | 'RUNNING' | 'SUCCESS' | 'ERROR';

const prProcessStatusDict: FlStatusDict<PrProcessStatus> = {
  DRAFT: FlStatusHelper.getDraftStatus('DRAFT'),
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
};

export function createRecordSpecs(record: Record<string, TdIOSpec>): Record<string, PrIO> {

  const res: Record<string, PrIO> = {}

  for (const i of Object.keys(record)) {
    res[i] = new PrIO(record[i]);
  }

  return res;
}

/**
 * Task or protocol inside a flow
 */
export abstract class PrProcess extends PrNode {

  processTypingName: string;

  data: PrProcessData;

  experimentId: string;

  @FlStatusTransform(prProcessStatusDict)
  status: FlStatus<PrProcessStatus>;

  brickVersion?: string;

  config: PrConfig;

  name: string;

  @ClRecordTransform(PrIO)
  inputs: Record<string, PrIO>;

  @ClRecordTransform(PrIO)
  outputs: Record<string, PrIO>;

  isArchived: boolean;

  isProtocol: boolean;

  protected constructor(inputNode?: PrProtocolGraphInputNode) {
    super();
    if (inputNode) {
      this.data = {
        graph: inputNode.graph ? inputNode.graph : null,
        title: inputNode.human_name,
        description: inputNode.short_description
      };
      this.brickVersion = inputNode.brick_version;
      this.processTypingName = inputNode.process_typing_name;
      this.config = new PrConfig();
      this.config.data = new PrConfigData();
      this.config.data.values = inputNode.config.data as PrConfigValues;
      if(inputNode.config.specs){
        this.config.data.specs = new PrConfigSpecs(inputNode.config.specs);
      }

      if (inputNode.input_specs) {
        this.inputs = createRecordSpecs(inputNode.input_specs);
      }
      if (inputNode.output_specs) {
        this.outputs = createRecordSpecs(inputNode.output_specs);
      }
    }
  }

  get title(): string {
    return this.data ? this.data.title  || this.name : this.name;
  }

  public hasConfig(): boolean {
    return this.config?.data.specs.hasProperties() ?? false;
  }

  public updateConfig(config: PrConfigValues): void {
    this.config.updateConfig(config);
  }

  // return true if the process is of type Source
  isSource(): boolean {
    return this.processTypingName === PrTypingName.task.source;
  }

  // return true if the process is of type Output
  isOutput(): boolean {
    return this.processTypingName === PrTypingName.task.output;
  }

  isRunning(): boolean {
    return this.status.value === 'RUNNING';
  }
}
