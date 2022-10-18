import {PrConfigView, PrWorkflowMode, PrWorkflowNodeProcess, PrWorkflowPort} from '@monorepo/protocol';
import {FlMenuDynamicButton} from '@monorepo/front-core-lib';
import {ClHelpService} from '@monorepo/core-lib';
import {CaLabInstanceService} from '../../../../ca-core/service-api/ca-lab-instance.service';
import {CaLabInstance} from '../../../../ca-core/model/entities/ca-lab-instance.class';

export class CaWorkflowConfig extends PrConfigView {

  constructor(
    private labInstance: CaLabInstance
  ) {
    super();
  }



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
    console.log(this.labInstance.isRunning())
    return {
      type: 'button',
      text: {text: 'resource', translateText: true},
      icon: 'resource',
      onClick: () => this.openResourceDetail(resourceId),
      disabled: ClHelpService.isNullOrEmpty(resourceId) || !this.labInstance.isRunning()
    };
  }

  private openResourceDetail(resourceId: string): void {
    if(this.labInstance.isRunning()){
      window.location.href = `${this.labInstance.frontUrl}/app/databox/resource/${resourceId}`;
    }
  }

}
