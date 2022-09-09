import {PrConfigView, PrWorkflowMode, PrWorkflowNodeProcess, PrWorkflowPort} from '@monorepo/protocol';
import {FlMenuDynamicButton} from '@monorepo/front-core-lib';

export class CaWorkflowConfig extends PrConfigView {
  getInputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess, workflowMode: PrWorkflowMode): FlMenuDynamicButton[] {
    return [];
    // return [
    //   {
    //     text: {text: 'Test1', translateText: false},
    //     icon: 'resource',
    //     onClick: () => {
    //     },
    //     disabled: () => this.getWorkflowMode() !== 'edit'
    //   },
    //   {
    //     text: {text: 'Test2', translateText: false},
    //     icon: 'resource',
    //     onClick: () => {
    //     },
    //     disabled: () => this.getWorkflowMode() === 'edit'
    //   }
    // ];
  }


  getOutputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess, workflowMode: PrWorkflowMode): FlMenuDynamicButton[] {
    return [];
    // return [
    //   {
    //     text: {text: 'Test1', translateText: false},
    //     icon: 'resource',
    //     onClick: () => {
    //     },
    //     disabled: () => this.getWorkflowMode() !== 'edit'
    //   },
    //   {
    //     text: {text: 'Test2', translateText: false},
    //     icon: 'resource',
    //     onClick: () => {
    //     },
    //     disabled: () => this.getWorkflowMode() === 'edit'
    //   }];
  }
}
