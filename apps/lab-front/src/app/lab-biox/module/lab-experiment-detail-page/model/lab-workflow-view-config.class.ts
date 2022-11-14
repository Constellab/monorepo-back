import {
  PrConfigView,
  PrWorkflowMode,
  PrWorkflowNode,
  PrWorkflowNodeProcess,
  PrWorkflowNodeSource,
  PrWorkflowPort
} from '@monorepo/protocol';
import {FlDialogService, FlMenuDynamicButton, FlSavedSearch, flThemeDetailLight} from '@monorepo/front-core-lib';
import {
  LabResourceDetailDialogComponent
} from '../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-detail-dialog/lab-resource-detail-dialog.component';
import {
  LabSelectTypeDialogComponent,
  LabSelectTypeDialogInput
} from '../../../../lab-core/entity-module/lab-type-core/component/lab-select-type-dialog/lab-select-type-dialog.component';
import {LabTypeEntity} from '../../../../lab-core/model/entities/lab-type/lab-type.entity';
import {
  LabResourceSearchFields
} from '../../../../lab-core/entity-module/lab-resource-core/model/lab-resource-advanced-search.class';
import {
  labResourceSearchName
} from '../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-search/lab-resource-search.component';
import {
  LabSelectResourceDialogComponent,
  LabSelectResourceDialogInput
} from '../../../../lab-core/entity-module/lab-resource-core/component/lab-select-resource-dialog/lab-select-resource-dialog.component';
import {LabResource} from '../../../../lab-core/model/entities/resource/lab-resource.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {LabWorkflowEditConfig} from './lab-workflow-edit-config.class';

export class LabWorkflowViewConfig extends PrConfigView {

  constructor(private dialogService: FlDialogService,
              private editState: LabWorkflowEditConfig) {
    super();
  }


  getInputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess,
               workflowMode: PrWorkflowMode): FlMenuDynamicButton[] {
    const resourceId: string = node.currentObject.inputs[port.name]?.resource_id ?? null;

    return [
      {
        type: 'button',
        text: {text: 'biox.add_source', translateText: true},
        icon: 'resource',
        onClick: () => this.openResourceSelection(port, node),
        // only activated if is editable and the port is not connected
        disabled: workflowMode === 'readOnly' || node.inputPortIsConnected(port.drawFlowName)
      },
      this.getProcessSuggestionButton(port, node, 'input', workflowMode),
      this.getResourceDetailContextButton(resourceId)
    ];
  }

  getOutputMenu(port: PrWorkflowPort, node: PrWorkflowNodeProcess,
                workflowMode: PrWorkflowMode): FlMenuDynamicButton[] {
    const resourceId: string = node.currentObject.outputs[port.name]?.resource_id ?? null;

    return [
      {
        type: 'button',
        text: {text: 'biox.add_output', translateText: true},
        icon: 'output',
        onClick: () => this.addTaskOutput(node.nodeName, port.name),
        disabled: workflowMode === 'readOnly'
      },
      {
        type: 'button',
        text: {text: 'biox.add_viewer', translateText: true},
        icon: 'view',
        onClick: () => this.addViewerToOutput(node.nodeName, port.name),
        disabled: workflowMode === 'readOnly'
      },
      {
        type: 'button',
        text: {text: 'biox.add_transformer', translateText: true},
        icon: 'transformer',
        onClick: () => this.openTransformerSelection(node.nodeName, port, node),
        disabled: workflowMode === 'readOnly'
      },
      this.getProcessSuggestionButton(port, node, 'output', workflowMode),
      this.getResourceDetailContextButton(resourceId)
    ];
  }


  private openResourceSelection(port: PrWorkflowPort, node: PrWorkflowNodeProcess): void {
    // add a default search filtered by resource type
    const filter: Partial<LabResourceSearchFields> = {
      resourceTypingName: port.specs.resource_types.map((type) => type.typing_name)
    };
    const savedSearch: FlSavedSearch = {
      searchName: labResourceSearchName,
      id: null,
      label: 'Compatible resources',
      color: flThemeDetailLight.primary,
      version: 1,
      default: true,
      filtersCriteria: filter
    };

    const data: LabSelectResourceDialogInput = {
      savedSearches: [savedSearch]
    };

    this.dialogService.openBigDialog(LabSelectResourceDialogComponent, {data: data}).afterClosed().subscribe(
      resource => this.addSource(resource, port, node)
    );
  }

  private addSource(resource: LabResource | null, port: PrWorkflowPort, node: PrWorkflowNodeProcess): void {
    if (resource == null) return;

    this.editState.addSourceToProcessInput(resource.id, node.nodeName, port.name, resource.name);
  }

  private addTaskOutput(processNodeName: string, outputPortName: string): void {
    this.editState.addTaskOutput(processNodeName, outputPortName);
  }

  private addViewerToOutput(processNodeName: string, outputPortName: string): void {
    this.editState.addViewerToOutput(processNodeName, outputPortName);
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

  private getProcessSuggestionButton(port: PrWorkflowPort, node: PrWorkflowNodeProcess,
                                     portType: 'input' | 'output', workflowMode: PrWorkflowMode): FlMenuDynamicButton {
    return {
      type: 'button',
      text: {text: 'biox.suggested_processes', translateText: true},
      icon: 'tips_and_updates',
      onClick: () => this.openProcessSuggestion(port, node, portType),
      disabled: workflowMode === 'readOnly'
    };
  }

  private openResourceDetail(resourceId: string): void {
    this.dialogService.openBigDialog(LabResourceDetailDialogComponent,
      {
        data: resourceId, panelClass: 'g-dialog-main-background', closeOnNavigation: true
      });
  }

  private openProcessSuggestion(port: PrWorkflowPort, node: PrWorkflowNode,
                                portType: 'input' | 'output'): void {
    const data: LabSelectTypeDialogInput = {
      searchConfig: {
        mode: 'processSuggestion',
        // if the port type selected is an input, we need to suggest process where output matches the input
        suggestBy: portType === 'input' ? 'outputs' : 'inputs',
        resourceTypingNames: this.getPortTypingNames(port, node)
      }
    };
    this.dialogService.openBigDialog(LabSelectTypeDialogComponent, {data: data}).afterClosed().subscribe(
      processType => {
        // if the process where suggested
        if (portType == 'input') {
          this.addProcessConnectedToInput(processType, node.nodeName, port.name);
        } else {
          this.addProcessConnectedToOutput(processType, node.nodeName, port.name);
        }
      }
    );
  }

  private addProcessConnectedToOutput(processType: LabTypeEntity | null, outputProcessName: string, outputPortName: string): void {
    if (processType == null) return;

    this.editState.addProcessConnectedToOutput(processType.typingName, processType.humanName, outputProcessName, outputPortName);
  }

  private addProcessConnectedToInput(processType: LabTypeEntity | null, inputProcessName: string, inputPortName: string): void {
    if (processType == null) return;

    this.editState.addProcessConnectedToInput(processType.typingName, processType.humanName, inputProcessName, inputPortName);
  }


  ///////////////////////////////// TRANSFORMER /////////////////////////////////
  private openTransformerSelection(outputProcessName: string, port: PrWorkflowPort, node: PrWorkflowNodeProcess): void {
    const data: LabSelectTypeDialogInput = {
      searchConfig: {
        mode: 'transformer',
        resourceTypingNames: this.getPortTypingNames(port, node)
      }
    };
    this.dialogService.openBigDialog(LabSelectTypeDialogComponent, {data: data}).afterClosed().subscribe(
      processType => this.addProcessConnectedToOutput(processType, outputProcessName, port.name)
    );
  }

  /**
   * Return the typing names for a port.
   * If the node is a Source, we take the type of the resource instead (if configured)
   */
  private getPortTypingNames(port: PrWorkflowPort, node: PrWorkflowNode): string[] {
    // special case
    // of the type of the port
    if (node instanceof PrWorkflowNodeSource && node.getCurrentResource() != null) {
      return [node.getCurrentResource().resourceTypingName];
    } else {
      // use the port typing names
      return port.getResourceTypingNames();
    }
  }

}
