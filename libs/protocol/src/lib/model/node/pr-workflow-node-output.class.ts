import {PrWorkflowPort} from '../pr-workflow-port.class';
import {PrWorkflowNodeIo} from './pr-workflow-node-io.class';
import {PrProcess} from '../pr-process.entity';
import {TdTypingName} from '@monorepo/technical-doc';

export class PrWorkflowNodeOutput extends PrWorkflowNodeIo {

  override getHTML(): string {
    return `<pr-workflow-node-output name="${this.nodeName}"></pr-workflow-node-output>`;
  }

  getClassName(): string {
    return 'task-output';
  }

  // return the only port (output for source and input for output)
  protected getPort(): PrWorkflowPort {
    return this.inputPorts[0];
  }

  protected getResourceId(process: PrProcess): string | null {
    return process.inputs[TdTypingName.task.output.resourceInput].resource_id  ?? null;
  }


}
