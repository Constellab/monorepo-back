import {PrWorkflowNode} from '../model/node/pr-workflow-node.class';
import {PrWorkflow, PrWorkflowMode} from '../model/pr-workflow.class';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PrWorkflowLayer} from '../model/pr-workflow-layer.class';
import {PrWorkflowNodeProtocol} from '../model/node/pr-workflow-node-protocol.class';
import {PrConfigView} from '../model/pr-config-view.class';


/**
 * State for the workflow, it is created for the module and can only manage on state a the time
 */
@Injectable()
export class PrWorkflowManagerState {

  public workflow: PrWorkflow = null;
  public viewConfig: PrConfigView = null;

  private workflowElement: HTMLElement;

  private idGenerator: number = 0;

  private mode$: Observable<PrWorkflowMode>;
  private currentMode: PrWorkflowMode;

  constructor() {
  }


  // unique function stored to override workflow event
  private stopEventFunction = (event: any): void => {
    event.stopImmediatePropagation();
  };

  //////////////////////// LAYER ////////////////////////////

  public init(element: HTMLElement, workflow: PrWorkflow,
              mode$: Observable<PrWorkflowMode>,
              viewConfig: PrConfigView): PrWorkflow {
    this.workflowElement = element;
    this.mode$ = mode$;
    this.currentMode = 'edit';
    this.viewConfig = viewConfig;

    this.workflow = workflow;

    this.workflow.start(element);

    this.subscribeToMode();


    return this.workflow;
  }

  public selectLayer(layerId: string, protocolNode?: PrWorkflowNodeProtocol): void {
    if (this.workflow.hasLayer(layerId)) {
      this.workflow.selectLayer(layerId);
    } else {
      if (protocolNode) {
        this.workflow.loadSubProtocolLayer(protocolNode, true);
      }
    }
  }

  public findNodeWithNameInCurrentLayer(name: string): PrWorkflowNode {
    return this.workflow.findNodeByNameInCurrentLayer(name);
  }

  public clear(): void {
    this.idGenerator = 0;
    this.workflow.deInitDrawflow();
    this.workflow = null;
  }


  public getCurrentLayerHierarchy$(): Observable<PrWorkflowLayer[]> {
    return this.workflow.getCurrentLayerHierarchy();
  }

  //////////////////////// MODE ////////////////////////////

  /**
   * Subscribe to mode to disable or enable workflow events
   * @private
   */
  private subscribeToMode(): void {
    this.mode$.subscribe(mode => {
      this.currentMode = mode;
      if (mode === 'readOnly') {
        this.workflowElement.addEventListener('contextmenu', this.stopEventFunction, true);
        this.workflowElement.addEventListener('keydown', this.stopEventFunction, true);
      } else {
        this.workflowElement.removeEventListener('contextmenu', this.stopEventFunction, true);
        this.workflowElement.removeEventListener('keydown', this.stopEventFunction, true);
      }
    });
  }

  public getMode$(): Observable<PrWorkflowMode> {
    return this.mode$;
  }

  public getCurrentMode(): PrWorkflowMode {
    return this.currentMode;
  }
}

