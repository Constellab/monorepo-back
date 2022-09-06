import {PrWorkflowPort} from '../pr-workflow-port.class';
import {PrWorkflowNodeIo} from './pr-workflow-node-io.class';
import {PrProcess} from '../pr-process.entity';
import {TdTaskSourceConfig} from '@monorepo/technical-doc';

export class PrWorkflowNodeSource extends PrWorkflowNodeIo {

  getHTML(): string {
    return `<pr-workflow-node-source name="${this.nodeName}"></pr-workflow-node-source>`;
  }

  getClassName(): string {
    return 'task-source';
  }

  // return the only port (output for source and input for output)
  protected getPort(): PrWorkflowPort {
    return this.outputPorts[0];
  }

  protected getResourceId(process: PrProcess): string | null {
    const config: TdTaskSourceConfig = process.config.values as TdTaskSourceConfig;
    return config?.resource_id ?? null;
  }


}
