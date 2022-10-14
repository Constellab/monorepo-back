import {PrConfigView, PrWorkflowMode, PrWorkflowNodeProcess, PrWorkflowPort} from '@monorepo/protocol';
import {FlMenuDynamicButton} from '@monorepo/front-core-lib';
import {ClHelpService} from '@monorepo/core-lib';
import {CaLabInstanceService} from '../../../../ca-core/service-api/ca-lab-instance.service';

export class CaWorkflowConfig extends PrConfigView {

  constructor(
    private labInstanceId: string,
    private labInstanceService: CaLabInstanceService
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
    return {
      type: 'button',
      text: {text: 'resource', translateText: true},
      icon: 'resource',
      onClick: () => this.openResourceDetail(resourceId),
      disabled: ClHelpService.isNullOrEmpty(resourceId)
    };
  }

  private openResourceDetail(resourceId: string): void {
    this.labInstanceService.logUserToLab(this.labInstanceId).subscribe(
      result => this.loginSuccess(result.url, resourceId)
    );
  }

  private loginSuccess(url: string, resourceId: string): void{
    // redirect to the lab resource page url
    window.location.href = url + '/app/databox/resource/' + resourceId;
  }

}
