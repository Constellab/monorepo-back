import {Directive, ElementRef, Input, OnDestroy, Renderer2} from '@angular/core';
import {LabWorkflowNodeProcess} from '../../model/lab-workflow-node-process.class';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {
  LabResourceDetailDialogComponent
} from '../../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-detail-dialog/lab-resource-detail-dialog.component';
import {FlDialogService, FlHtmlHelper, FlMenuDynamic, FlMenuDynamicService} from '@monorepo/front-core-lib';
import {LabWorkflowPort} from '../../model/lab-workflow-port.class';
import {
  LabSelectResourceDialogComponent
} from '../../../../../lab-core/entity-module/lab-resource-core/component/lab-select-resource-dialog/lab-select-resource-dialog.component';
import {LabResource} from '../../../../../lab-core/model/entities/resource/lab-resource.entity';

/**
 * Abstract component directive to extends by Workflow node components
 */
@Directive()
export abstract class LabWorkflowNodeDirective implements OnDestroy {
  // Name of the node
  @Input() name: string;

  node: LabWorkflowNodeProcess;

  private listener: () => void;


  protected constructor(protected workflowManager: LabWorkflowManagerState,
                        protected drawerState: LabWorkflowActionState,
                        protected dialogService: FlDialogService,
                        protected elementRef: ElementRef,
                        protected renderer: Renderer2,
                        protected menuDynamicService: FlMenuDynamicService) {
  }

  protected initNode(): void {
    this.node = this.workflowManager.findNodeWithNameInCurrentLayer(this.name) as LabWorkflowNodeProcess;
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

    this.listenToNodeClick();
  }

  openNodeDetail(): void {
    this.drawerState.newAction({
      action: 'selectNode',
      processNode: this.node,
      title: this.node.title
    });
  }

  openResourceDetail(resourceId: string): void {
    this.dialogService.openBigDialog(LabResourceDetailDialogComponent, {data: resourceId});
  }

  protected listenToNodeClick(): void {
    // retrieve the drawflow element that wrap the node
    const parent: HTMLElement = FlHtmlHelper.getParent(this.elementRef.nativeElement, {className: 'parent-node'});

    if (parent == null) return;

    this.listener = this.renderer.listen(parent, 'click', event => this.onNodeClick(event));
  }

  private onNodeClick(event: PointerEvent): void {
    const element: HTMLElement = event.target as any;

    const classes: string[] = FlHtmlHelper.domTokenListToArray(element.classList);
    if (classes.includes('input')) {
      const inputName: string = classes.find((cls) => cls.startsWith('input_'));
      if (inputName == null) return;

      const port = this.node.findInputPortByDrawflowName(inputName);
      if (port == null) return;

      this.onInputClick(port, element);
    } else if (classes.includes('output')) {
      const outputName: string = classes.find((cls) => cls.startsWith('output_'));
      if (outputName == null) return;

      const port = this.node.findOutputPortByDrawflowName(outputName);
      if (port == null) return;

      this.onOutputClick(port.name, element);
    }
  }

  private onInputClick(port: LabWorkflowPort, element: Element): void {
    const dynamicMenu = this.getInputPortContextMenuConfig(port);
    this.menuDynamicService.openDynamicMenuRelative(dynamicMenu, element);

  }

  private onOutputClick(portName: string, element: Element): void {
    const dynamicMenu = this.getOutputPortContextMenuConfig(portName);
    this.menuDynamicService.openDynamicMenuRelative(dynamicMenu, element);
  }


  private openResourceSelection(portName: string): void {
    this.dialogService.openBigDialog(LabSelectResourceDialogComponent).afterClosed().subscribe(
      resource => this.addSource(resource, portName)
    );
  }

  private addSource(resource: LabResource | null, inputPortName: string): void {
    if (resource == null) return;

    this.workflowManager.addSourceToProcessInput(this.node.nodeName, inputPortName,
      resource.id, resource.name);
  }

  private addTaskOutput(outputPortName: string): void {
    this.workflowManager.addTaskOutput(this.node.nodeName, outputPortName);
  }

  private getInputPortContextMenuConfig(port: LabWorkflowPort): FlMenuDynamic[] {
    const resourceId: string = this.node.currentObject.inputs[port.name]?.resource_id ?? null;

    return [
      {
        type: 'button',
        text: {text: 'biox.add_source', translateText: true},
        icon: 'resource',
        onClick: () => this.openResourceSelection(port.name),
        disabled: this.node.inputPortIsConnected(port.drawFlowName) || !this.experimentIsEditable
      },
      this.getResourceDetailContextButton(resourceId)
    ];
  }

  private getOutputPortContextMenuConfig(portName: string): FlMenuDynamic[] {
    const resourceId: string = this.node.currentObject.outputs[portName]?.resource_id ?? null;

    return [
      {
        type: 'button',
        text: {text: 'biox.add_output', translateText: true},
        icon: 'output',
        onClick: () => this.addTaskOutput(portName),
        disabled: !this.experimentIsEditable
      },
      this.getResourceDetailContextButton(resourceId)
    ];
  }

  private getResourceDetailContextButton(resourceId: string | null): FlMenuDynamic {
    return {
      type: 'button',
      text: {text: 'biox.view_resource', translateText: true},
      icon: 'visibility',
      onClick: () => this.openResourceDetail(resourceId),
      disabled: resourceId == null || resourceId.length === 0
    };
  }

  private get experimentIsEditable(): boolean {
    return this.workflowManager.getExperiment().isEditable();
  }

  ngOnDestroy(): void {
    if (this.listener) {
      this.listener();
    }
  }
}

