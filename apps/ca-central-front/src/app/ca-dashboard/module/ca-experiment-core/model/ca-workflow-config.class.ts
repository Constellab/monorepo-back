import {PrConfigView, PrWorkflowMode, PrWorkflowNodeProcess, PrWorkflowPort} from '@monorepo/protocol';
import {FlMenuDynamicButton} from '@monorepo/front-core-lib';
import {ClHelpService} from '@monorepo/core-lib';

export class CaWorkflowConfig extends PrConfigView {

  getInputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess,
               workflowMode: PrWorkflowMode): FlMenuDynamicButton[] {
    const resourceId: string = node.currentObject.inputs[port.name]?.resource_id ?? null;

    return [
      this.getResourceDetailContextButton(resourceId)
    ];
  }

  getOutputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess,
                workflowMode: PrWorkflowMode): FlMenuDynamicButton[] {
    const resourceId: string = node.currentObject.outputs[port.name]?.resource_id ?? null;

    return [
      this.getResourceDetailContextButton(resourceId)
    ];
  }

  private getResourceDetailContextButton(resourceId: string | null): FlMenuDynamicButton {
    return {
      type: 'button',
      text: {text: 'resource', translateText: true},
      icon: 'resource',
      onClick: () => this.openResourceDetail(resourceId),
      disabled: ClHelpService.isNullOrEmpty(resourceId)
    };
  }

  private openResourceDetail(resourceId: string): void {
    
  }

}
