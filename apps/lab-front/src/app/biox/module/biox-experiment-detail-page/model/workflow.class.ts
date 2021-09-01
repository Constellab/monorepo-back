import {WorkflowNode} from './workflow-node.class';
import {WorkflowConnection} from './workflow-connection.class';
import {WorkflowLayer} from './workflow-layer.class';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {WorkflowPort} from './workflow-port.class';
import Drawflow, {ConnectionEvent, ConnectionStartEvent} from 'drawflow';
import {NgZone} from '@angular/core';
import {BioxFlowManager} from '../../../../core/model/global/biox-connection.class';

export type WorkflowMode = 'edit' | 'readOnly';

/**
 * Class to manage Drawflow
 */
export class Workflow {

  private readonly editor: Drawflow;

  private readonly layers: WorkflowLayer[];
  private currentLayer$: BehaviorSubject<WorkflowLayer>;

  private nodeGeneration: number = 0;

  // subject to trigger event when selected a workflow connection
  private connectionSelected$: Subject<WorkflowConnection> = new Subject<WorkflowConnection>();

  private mode: WorkflowMode;

  // if false there is no check when creating nodes or connections
  private checkOnCreate: boolean = true;

  constructor(private element: HTMLElement,
              name: string,
              object: BioxFlowManager,
              mode: WorkflowMode = 'edit',
              private ngZone: NgZone) {

    this.editor = new Drawflow(element);

    this.editor.zoom_value = 0.1;

    // set edit or readonly mode
    this.setMode(mode);

    // init layers
    const currentLayer: WorkflowLayer = new WorkflowLayer(this.editor, 'Home', name, object, null);
    this.layers = [currentLayer];

    // init subject
    this.currentLayer$ = new BehaviorSubject<WorkflowLayer>(currentLayer);

    this.editor.on('connectionCreated',
      (connection) => this.ngZone.run(() => this.onConnectionCreated(connection)));

    this.editor.on('connectionRemoved',
      (connection) => this.ngZone.run(() => this.onConnectionRemoved(connection)));

    this.editor.on('nodeRemoved', node => this.ngZone.run(() => this.onNodeRemoved(node)));

    this.editor.on('connectionSelected',
      event => this.ngZone.run(() => this.emitConnectionSelected(event)));

    this.editor.on('connectionStart',
      event => this.ngZone.run(() => this.onConnectionStarted(event)));

    this.editor.on('connectionCancel',
      () => this.ngZone.run(() => this.onConnectionCanceled()));
  }


  public start(): void {
    // run the start outside angular to prevent all drawflow event from triggering change detection
    this.ngZone.runOutsideAngular(() => {
      this.editor.start();
    });
  }

  public setData(data: any): void {
    this.editor.drawflow = data;
    // this.editor.import(data);
  }


  ////////////////////// LAYERS ///////////////////////////
  get currentLayer(): WorkflowLayer {
    return this.currentLayer$.value;
  }

  public selectLayer(layerId: string): void {
    // do nothing if this is the current layer
    if (this.currentLayer.id === layerId) {
      return;
    }

    const layer: WorkflowLayer = this.findLayerWithId(layerId);
    if (!layerId) {
      throw new Error(`The layer with id ${layerId} doesn't exist`);
    }

    // update the current layer
    this.currentLayer$.next(layer);
    this.editor.changeModule(layerId);
    layer.selectLayer();
  }

  public createSubLayerIfNotExists(layerId: string, name: string, title: string, object: BioxFlowManager): void {
    if (this.findLayerWithId(layerId) == null) {
      this.editor.addModule(layerId);
      this.layers.push(this.currentLayer.createSubLayer(layerId, name, title, object))
    }

    this.selectLayer(layerId);
  }

  public hasLayer(layerId: string): boolean {
    return this.findLayerWithId(layerId) != null;
  }


  // return the layer with the id
  private findLayerWithId(layerId: string): WorkflowLayer {
    return this.layers.find(layer => layer.id === layerId);
  }


  public getCurrentLayerHierarchy(): Observable<WorkflowLayer[]> {
    return this.currentLayer$.asObservable().pipe(
      map(layer => layer.getLayerHierarchy())
    );
  }

  private onConnectionStarted(event: ConnectionStartEvent): void {
    this.currentLayer.onConnectionStarted(event);
  }

  private onConnectionCanceled(): void {
    this.currentLayer.resetPortColors();
  }

  public getRootLayer(): WorkflowLayer {
    return this.layers[0];
  }

  ////////////////////// NODE ///////////////////////////
  public addNode(node: WorkflowNode<any>): void {
    this.currentLayer.addNode(node);
  }

  private onNodeRemoved(nodeId: number): void {
    this.currentLayer.onNodeRemoved(nodeId.toString());
  }


  public generateNodeName(): string {
    return `n${this.nodeGeneration++}`;
  }

  public findNodeWithId(nodeId: string): WorkflowNode<any> {
    for (const layer of this.layers) {
      const node = layer.findNodeWithId(nodeId);
      if (node != null) {
        return node;
      }
    }
    return null;
  }

  /**
   * Find (in the current layer) the node with the given name
   * We must search in current layer because in multiple layer we can have the same same
   */
  public findNodeWithNameInCurrentLayer(nodeName: string): WorkflowNode<any> {
    return this.currentLayer.findNodeWithName(nodeName);
  }

  public findNode(predicate: (node: WorkflowNode<any>) => boolean): WorkflowNode<any> {
    for (const layer of this.layers) {
      const node = layer.findNode(predicate);
      if (node != null) {
        return node;
      }
    }
    return null;
  }

  ////////////////////// CONNECTION ///////////////////////////

  public addConnection(connection: WorkflowConnection): void {
    this.currentLayer.addConnection(connection);
  }

  private onConnectionCreated(connection: ConnectionEvent): void {
    // check if input is available for the node
    const inputNode: WorkflowNode<any> = this.findNodeWithId(connection.input_id);
    const outputNode: WorkflowNode<any> = this.findNodeWithId(connection.output_id);
    const inputPort: WorkflowPort = inputNode.findInputPortByDrawflowName(connection.input_class);
    const outputPort: WorkflowPort = outputNode.findOutputPortByDrawflowName(connection.output_class);

    // check if the input is available and if the port are compatible
    // refuse if there are more than one connection (the new one is counting)
    if (this.checkOnCreate && (
      inputNode.countInputConnections(connection.input_class) > 1 ||
      !inputPort.isCompatible(outputPort))) {
      // remove the connection
      this.editor.removeSingleConnection(connection.output_id, connection.input_id,
        connection.output_class, connection.input_class);

      // consider the connection was canceled
      this.onConnectionCanceled();
      return;
    }

    this.currentLayer.saveConnection(connection);
  }

  private onConnectionRemoved(connection: ConnectionEvent): void {
    this.currentLayer.removeConnection(connection);
  }

  public onConnectionSelected(): Observable<WorkflowConnection> {
    return this.connectionSelected$.asObservable();
  }

  private emitConnectionSelected(connectionEvent: ConnectionEvent): void {
    const connection: WorkflowConnection = this.currentLayer.findConnection(connectionEvent);

    if (connection != null) {
      this.connectionSelected$.next(connection);
    }
  }

  //////////////////// OTHER ///////////////////////

  public setMode(mode: WorkflowMode): void {
    this.editor.editor_mode = mode === 'edit' ? 'edit' : 'fixed';
    this.mode = mode;
  }

  public getMode(): WorkflowMode {
    return this.mode;
  }

  public disableCheck(): void {
    this.checkOnCreate = false;
  }

  public enableCheck(): void {
    this.checkOnCreate = true;
  }

  public destroy(): void {
    this.connectionSelected$.complete();
    this.currentLayer$.complete();
  }
}
