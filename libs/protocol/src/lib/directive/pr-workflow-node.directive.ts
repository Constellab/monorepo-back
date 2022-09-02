import {AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2} from '@angular/core';
import {PrWorkflowNodeProcess} from '../model/pr-workflow-node-process.class';
import {PrWorkflowManagerState} from '../state/pr-workflow-manager-state';
import {PrWorkflowActionState} from '../state/pr-workflow-action-state';
import {FlDialogService, FlHtmlHelper} from '@monorepo/front-core-lib';

@Directive({
  selector: '[prWorkflowNode]'
})
export class PrWorkflowNodeDirective implements OnDestroy, AfterViewInit {

  // Name of the node
  @Input() name: string;

  node: PrWorkflowNodeProcess;

  private listener: () => void;

  stopEventFunction = (event: any): void => {
    event.stopImmediatePropagation()
  }

  constructor(protected workflowManager: PrWorkflowManagerState,
              protected drawerState: PrWorkflowActionState,
              protected dialogService: FlDialogService,
              protected elementRef: ElementRef,
              protected renderer: Renderer2) {
  }


  ngAfterViewInit(): void {
    this.workflowManager.workflow.getMode$().subscribe(mode => {
      for (const o of this.elementRef.nativeElement.parentElement.parentElement.querySelectorAll('.output')) {
        if (mode !== 'edit') {
          o.addEventListener('mousedown', this.stopEventFunction, true);
        } else {
          o.removeEventListener('mousedown', this.stopEventFunction, true);
        }
      }
    });
  }

  protected initNode(): void {
    this.node = this.workflowManager.findNodeWithNameInCurrentLayer(this.name) as PrWorkflowNodeProcess;
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

  }

  openNodeDetail(): void {
    this.drawerState.newAction({
      action: 'selectNode',
      processNode: this.node,
      title: this.node.title
    });
  }

  // private get experimentIsEditable(): boolean {
  //   return this.workflowManager.getExperiment().isEditable();
  // }

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

      // this.onInputClick(port, element);
    } else if (classes.includes('output')) {
      const outputName: string = classes.find((cls) => cls.startsWith('output_'));
      if (outputName == null) return;

      const port = this.node.findOutputPortByDrawflowName(outputName);
      if (port == null) return;

      // this.onOutputClick(port, element);
    }
  }

  //
  // private onInputClick(port: PrWorkflowPort, element: Element): void {
  //   const menuDynamics = this.getInputPortContextMenuConfig(port);
  //   this.openPortPortal(port, menuDynamics, element);
  // }
  //
  // private onOutputClick(port: PrWorkflowPort, element: Element): void {
  //   const menuDynamics = this.getOutputPortContextMenuConfig(port.name);
  //   this.openPortPortal(port, menuDynamics, element);
  //}

  // // open the portal for the input or output port
  // private openPortPortal(port: PrWorkflowPort, menuDynamics: FlMenuDynamic[], element: Element): void {
  //   const data: LabWorkflowPortActionPortalInput = {
  //     port: port,
  //     menuDynamics: menuDynamics
  //   };
  //
  //   const position: FlPortalConnectedPosition[] = [
  //     {originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
  //     'right', 'top', 'left', 'bottom'];
  //
  //   const config = this.portalService.configureRelativePortal(element, position, {
  //     disposeOnOutsideClick: true,
  //     disposeOnNavigation: true,
  //     elevation: true
  //   });
  //
  //   this.portalService.createPortal(LabWorkflowPortActionPortalComponent, config, data);
  // }

  // private openResourceSelection(port: LabWorkflowPort): void {
  //   // add a default search filtered by resource type
  //   const filter: Partial<LabResourceSearchFields> = {
  //     resourceTypingName: port.specs.resource_types.map((type) => type.typing_name)
  //   };
  //   const savedSearch: FlSavedSearch = {
  //     searchName: labResourceSearchName,
  //     id: null,
  //     label: 'Compatible resources',
  //     color: flThemeDetailLight.primary,
  //     version: 1,
  //     default: true,
  //     filtersCriteria: filter
  //   };
  //
  //   const data: LabSelectResourceDialogInput = {
  //     savedSearches: [savedSearch]
  //   };
  //
  //   this.dialogService.openBigDialog(LabSelectResourceDialogComponent, {data: data}).afterClosed().subscribe(
  //     resource => this.addSource(resource, port.name)
  //   );
  // }

  // private addSource(resource: LabResource | null, inputPortName: string): void {
  //   if (resource == null) return;
  //
  //   this.workflowManager.addSourceToProcessInput(resource.id, this.node.nodeName, inputPortName, resource.name);
  // }

  // private addTaskOutput(outputPortName: string): void {
  //   this.workflowManager.addTaskOutput(this.node.nodeName, outputPortName);
  // }

  // private openTransformerSelection(portName: string, resourceTypingNames: string[]): void {
  //   const data: LabSelectTypeDialogInput = {
  //     searchConfig: {
  //       mode: 'transformer',
  //       resourceTypingNames: resourceTypingNames
  //     }
  //   };
  //   this.dialogService.openBigDialog(LabSelectTypeDialogComponent, {data: data}).afterClosed().subscribe(
  //     processType => this.addProcessConnectedToOutput(processType, portName)
  //   );
  // }

  // private openProcessSuggestion(portName: string, resourceTypingNames: string[],
  //                               portType: 'input' | 'output'): void {
  //   const data: LabSelectTypeDialogInput = {
  //     searchConfig: {
  //       mode: 'processSuggestion',
  //       // if the port type selected is an input, we need to suggest process where output matches the input
  //       suggestBy: portType === 'input' ? 'outputs' : 'inputs',
  //       resourceTypingNames: resourceTypingNames
  //     }
  //   };
  //   this.dialogService.openBigDialog(LabSelectTypeDialogComponent, {data: data}).afterClosed().subscribe(
  //     processType => {
  //       // if the process where suggested
  //       if (portType == 'input') {
  //         this.addProcessConnectedToInput(processType, portName);
  //       } else {
  //         this.addProcessConnectedToOutput(processType, portName);
  //       }
  //     }
  //   );
  // }

  // private addProcessConnectedToOutput(processType: LabTypeEntity | null, portName: string): void {
  //   if (processType == null) return;
  //
  //   this.workflowManager.addProcessConnectedToOutput(processType.typingName, this.node.nodeName, this.node.nodeName, portName);
  // }
  //
  // private addProcessConnectedToInput(processType: LabTypeEntity | null, portName: string): void {
  //   if (processType == null) return;
  //
  //   this.workflowManager.addProcessConnectedToInput(processType.typingName, this.node.nodeName, this.node.nodeName, portName);
  // }

  // private getInputPortContextMenuConfig(port: PrWorkflowPort): FlMenuDynamic[] {
  //   const resourceId: string = this.node.currentObject.inputs[port.name]?.resource_id ?? null;
  //
  //   const resourceTypingNames = this.node.getPortResourceTypingNames(port.name, 'input');
  //
  //
  //   return [
  //     {
  //       type: 'button',
  //       text: {text: 'biox.add_source', translateText: true},
  //       icon: 'resource',
  //       onClick: () => this.openResourceSelection(port),
  //       // only activated if is editable and the port is not connected
  //       disabled: this.node.inputPortIsConnected(port.drawFlowName) || !this.experimentIsEditable
  //     },
  //     this.getProcessSuggestionButton(port.name, resourceTypingNames, 'input'),
  //     this.getResourceDetailContextButton(resourceId)
  //   ];
  // }

  // private getOutputPortContextMenuConfig(portName: string): FlMenuDynamic[] {
  //   const resourceId: string = this.node.currentObject.outputs[portName]?.resource_id ?? null;
  //
  //   const resourceTypingNames = this.node.getPortResourceTypingNames(portName, 'output');
  //
  //   return [
  //     {
  //       type: 'button',
  //       text: {text: 'biox.add_output', translateText: true},
  //       icon: 'output',
  //       onClick: () => this.addTaskOutput(portName),
  //       disabled: !this.experimentIsEditable
  //     },
  //     {
  //       type: 'button',
  //       text: {text: 'biox.add_transformer', translateText: true},
  //       icon: 'transformer',
  //       onClick: () => this.openTransformerSelection(portName, resourceTypingNames),
  //       disabled: !this.experimentIsEditable || resourceTypingNames == null
  //     },
  //     this.getProcessSuggestionButton(portName, resourceTypingNames, 'output'),
  //     this.getResourceDetailContextButton(resourceId)
  //   ];
  // }

  // private getResourceDetailContextButton(resourceId: string | null): FlMenuDynamic {
  //   return {
  //     type: 'button',
  //     text: {text: 'biox.view_resource', translateText: true},
  //     icon: 'visibility',
  //     onClick: () => this.openResourceDetail(resourceId),
  //     disabled: resourceId == null || resourceId.length === 0
  //   };
  // }
  //
  // private getProcessSuggestionButton(portName: string, resourceTypingNames: string[], portType: 'input' | 'output'): FlMenuDynamic {
  //   return {
  //     type: 'button',
  //     text: {text: 'biox.suggested_processes', translateText: true},
  //     icon: 'tips_and_updates',
  //     onClick: () => this.openProcessSuggestion(portName, resourceTypingNames, portType),
  //     disabled: !this.experimentIsEditable || resourceTypingNames == null
  //   };
  // }

  ngOnDestroy(): void {
    if (this.listener) {
      this.listener();
    }
  }
}
