import {PrWorkflowPort} from '../pr-workflow-port.class';
import {PrWorkflowNodeIo} from './pr-workflow-node-io.class';
import {map, Observable} from 'rxjs';
import {PrProcess} from '../pr-process.entity';
import {TdTaskViewerConfig, TdTypingName} from '@monorepo/technical-doc';

export class PrWorkflowNodeViewer extends PrWorkflowNodeIo {

  getHTML(): string {
    return `<pr-workflow-node-viewer name="${this.nodeName}"></pr-workflow-node-viewer>`;
  }

  getClassName(): string {
    return 'task-viewer';
  }

  // return the only port (output for source and input for output)
  protected getPort(): PrWorkflowPort {
    return this.inputPorts[0];
  }

  public isConfigured$(): Observable<boolean> {
    return this.getConfigValues$().pipe(
      map((config: TdTaskViewerConfig) => config != null && config.view_config != null)
    );
  }

  protected getResourceId(process: PrProcess): string | null {
    return process.inputs[TdTypingName.task.output.resourceInput].resource_id ?? null;
  }


}
