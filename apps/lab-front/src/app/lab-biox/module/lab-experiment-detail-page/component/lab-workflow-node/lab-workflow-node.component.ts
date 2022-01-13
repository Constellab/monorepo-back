import {Component, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {FlContextMenuConfig, FlContextMenuService, FlDialogService, FlHtmlHelper} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {LabWorkflowNodeProcess} from '../../model/lab-workflow-node-process.class';
import {LabResource} from '../../../../../lab-core/model/entities/resource/lab-resource.entity';
import {
  LabSelectResourceDialogComponent
} from '../../../../../lab-core/entity-module/lab-resource-core/component/lab-select-resource-dialog/lab-select-resource-dialog.component';

/**
 * Node of an experiment in the workflow
 *
 * This component is converted to an angular element to be injectable in html
 */
@Component({
  selector: 'lab-workflow-node',
  templateUrl: './lab-workflow-node.component.html',
  styleUrls: ['./lab-workflow-node.component.scss']
})
export class LabWorkflowNodeComponent implements OnInit, OnDestroy {

  // Name of the node
  @Input() name: string;

  node: LabWorkflowNodeProcess;

  layerIsLoading$: Observable<boolean>;

  private listener: () => void;

  constructor(private workflowManager: LabWorkflowManagerState,
              private dialogService: FlDialogService,
              private drawerState: LabWorkflowActionState,
              private elementRef: ElementRef,
              private renderer: Renderer2,
              private contextMenuService: FlContextMenuService) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithName(this.name) as LabWorkflowNodeProcess;
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

    this.layerIsLoading$ = this.workflowManager.layerIsLoading$;
    this.listenToNodeClick();
  }

  nodeIsProtocol(): boolean {
    return this.node.object.isProtocol;
  }

  zoomInProtocol(): void {
    return this.workflowManager.selectLayer(this.node.nodeId);
  }

  openNodeDetail(): void {
    this.drawerState.newAction({
      action: 'selectNode',
      processNode: this.node,
      title: this.node.title
    });
  }

  showNodeStatus(): boolean {
    return this.node.object.status.value !== 'DRAFT';
  }

  private listenToNodeClick(): void {
    // retrieve the drawflow element that wrap the node
    const parent: HTMLElement = FlHtmlHelper.getParent(this.elementRef.nativeElement, 'parent-node');

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

      this.onInputClick(port.name, element);
    } else if (classes.includes('output')) {
      const outputName: string = classes.find((cls) => cls.startsWith('output_'));
      if (outputName == null) return;

      const port = this.node.findOutputPortByDrawflowName(outputName);
      if (port == null) return;

      this.onOutputClick(port.name, element);
    }
  }

  private onInputClick(portName: string, element: Element): void {
    const contextConfig = this.getInputPortContextMenuConfig(portName);
    this.contextMenuService.openContextMenu(contextConfig, element);

  }

  private onOutputClick(portName: string, element: Element): void {
    const contextConfig = this.getOutputPortContextMenuConfig(portName);
    this.contextMenuService.openContextMenu(contextConfig, element);
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

  private addSink(outputPortName: string): void {
    this.workflowManager.addSinkToProcessOutput(this.node.nodeName, outputPortName);
  }

  private getInputPortContextMenuConfig(portName: string): FlContextMenuConfig {
    return {
      buttons: [
        {
          text: {text: 'biox.add_source', translateText: true},
          icon: 'resource',
          onClick: () => this.openResourceSelection(portName),
        },
      ]
    };
  }

  private getOutputPortContextMenuConfig(portName: string): FlContextMenuConfig {
    return {
      buttons: [
        {
          text: {text: 'biox.add_sink', translateText: true},
          icon: 'output',
          onClick: () => this.addSink(portName),
        },
      ]
    };
  }

  ngOnDestroy(): void {
    if (this.listener) {
      this.listener();
    }
  }


}
