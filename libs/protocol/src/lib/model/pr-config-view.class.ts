import {FlMenuDynamicButton} from '@monorepo/front-core-lib';
import {PrWorkflowPort} from './pr-workflow-port.class';
import {PrWorkflowNodeProcess} from './node/pr-workflow-node-process.class';
import {PrWorkflowMode} from './pr-workflow.class';

export abstract class PrConfigView {


  // Node input & output dynamic menu
  abstract getInputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess,
                        workflowMode: PrWorkflowMode): FlMenuDynamicButton[];

  abstract getOutputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess,
                         workflowMode: PrWorkflowMode): FlMenuDynamicButton[];

}
