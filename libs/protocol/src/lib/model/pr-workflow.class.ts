import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrWorkflowConnection} from './pr-workflow-connection.class';
import Drawflow, {ConnectionEvent, ConnectionStartEvent} from 'drawflow';
import {PrWorkflowLayer} from './pr-workflow-layer.class';
import {BehaviorSubject, map, Observable, Subject} from 'rxjs';
import {PrFlowManager} from './pr-connection.class';
import {NgZone} from '@angular/core';
import {PrWorkflowPort} from './pr-workflow-port.class';

export type PrWorkflowMode = 'edit' | 'readOnly' | 'report';

export type PrWorkflowEvent =
  PrWorkflowDeleteNodeEvent
  | PrWorkflowConnectionEvent

export interface PrWorkflowDeleteNodeEvent {
  action: 'deleteNode';
  node: PrWorkflowNode<any>;
  protocolId: string;
}

export interface PrWorkflowConnectionEvent {
  action: 'addConnection' | 'deleteConnection';
  connection: PrWorkflowConnection;
  protocolId: string;
}


/**
 * Class to manage Drawflow
 */
export class PrWorkflow {

  private readonly editor: Drawflow;

  private readonly layers: PrWorkflowLayer[];
  private currentLayer$: BehaviorSubject<PrWorkflowLayer>;

  // subject to trigger event when selected a workflow connection
  private connectionSelected$: Subject<PrWorkflowConnection> = new Subject<PrWorkflowConnection>();

  private mode: PrWorkflowMode;

  private workflowEvent$: Subject<PrWorkflowEvent> = new Subject<PrWorkflowEvent>();

  constructor(private element: HTMLElement,
              name: string,
              object: PrFlowManager,
              mode: PrWorkflowMode = 'edit',
              private ngZone: NgZone) {

    this.editor = new Drawflow(element);

    this.editor.zoom_value = 0.1;


    // set edit or readonly mode
    this.setMode(mode);

    // init layers
    const currentLayer: PrWorkflowLayer = new PrWorkflowLayer(this.editor, name, object, null);
    this.layers = [currentLayer];

    // init subject
    this.currentLayer$ = new BehaviorSubject<PrWorkflowLayer>(currentLayer);


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

    this.editor.on('nodeMoved',
      (node) => this.ngZone.run(() => this.onNodeMoved(node))
    );
  }


  public start(): void {
    // run the start outside angular to prevent all drawflow event from triggering change detection
    this.ngZone.runOutsideAngular(() => {
      this.editor.start();
      // create and selection the default module
      this.editor.addModule(this.currentLayer.id);
      this.editor.changeModule(this.currentLayer.id);

    });
  }

  public setData(data: any): void {
    this.editor.drawflow = data;
    // this.editor.import(data);
  }


  ////////////////////// LAYERS ///////////////////////////
  get currentLayer(): PrWorkflowLayer {
    return this.currentLayer$.value;
  }

  public selectLayer(layerId: string): void {
    // do nothing if this is the current layer
    if (this.currentLayer.id === layerId) {
      return;
    }

    const layer: PrWorkflowLayer = this.findLayerWithId(layerId);
    if (!layerId) {
      throw new Error(`The layer with id ${layerId} doesn't exist`);
    }

    // update the current layer
    this.currentLayer$.next(layer);
    this.editor.changeModule(layerId);
    layer.selectLayer();
  }

  public createSubLayerIfNotExists(name: string, title: string, object: PrFlowManager, selectLayer: boolean = true): PrWorkflowLayer {

    let layer: PrWorkflowLayer = this.findLayerWithId(object.id);
    if (layer == null) {
      this.editor.addModule(object.id);
      layer = this.currentLayer.createSubLayer(name, title, object);
      this.layers.push(layer);
    }

    if (selectLayer) {
      this.selectLayer(object.id);
    }
    return layer;
  }

  public hasLayer(layerId: string): boolean {
    return this.findLayerWithId(layerId) != null;
  }


  // return the layer with the id
  public findLayerWithId(layerId: string): PrWorkflowLayer {
    return this.layers.find(layer => layer.id === layerId);
  }

  public getCurrentLayerHierarchy(): Observable<PrWorkflowLayer[]> {
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


  ////////////////////// NODE ///////////////////////////

  private onNodeRemoved(nodeId: number): void {
    const node: PrWorkflowNode<any> = this.currentLayer.removeNode(nodeId.toString());
    if (node) {
      this.workflowEvent$.next({
        action: 'deleteNode',
        node: node,
        protocolId: this.currentLayer.object.id
      });
    }
  }

  public findNodeWithId(nodeId: string): PrWorkflowNode<any> {
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
   * We must search in current layer because in multiple layer we can have the same
   */
  public findNodeWithNameInCurrentLayer(nodeName: string): PrWorkflowNode<any> {
    return this.currentLayer.findNodeWithName(nodeName);
  }

  public findNode(predicate: (node: PrWorkflowNode<any>) => boolean): PrWorkflowNode<any> {
    for (const layer of this.layers) {
      const node = layer.findNode(predicate);
      if (node != null) {
        return node;
      }
    }
    return null;
  }

  // refresh the node position in the object
  private onNodeMoved(nodeId: string): void {
    const node = this.currentLayer.findNodeWithId(nodeId.toString());
    if (node) {
      node.refreshCoords();
    }
  }

  ////////////////////// CONNECTION ///////////////////////////

  private onConnectionCreated(connectionEvent: ConnectionEvent): void {
    // check if input is available for the node
    const inputNode: PrWorkflowNode<any> = this.findNodeWithId(connectionEvent.input_id);
    const outputNode: PrWorkflowNode<any> = this.findNodeWithId(connectionEvent.output_id);
    const inputPort: PrWorkflowPort = inputNode.findInputPortByDrawflowName(connectionEvent.input_class);
    const outputPort: PrWorkflowPort = outputNode.findOutputPortByDrawflowName(connectionEvent.output_class);

    // if the connection already exists, we don't need to do anything
    // this happened when the add_connection is called and the connection is added by code not user
    if (this.findConnection(outputNode.nodeId, inputNode.nodeId, outputPort.name, inputPort.name) != null) {
      return;
    }

    // check if the input is available and if the port are compatible
    // refuse if there are more than one connection (the new one is counting)
    if (inputNode.countInputConnections(connectionEvent.input_class) > 1 ||
      !inputPort.isCompatible(outputPort)) {

      // remove the connection
      this.editor.removeSingleConnection(connectionEvent.output_id, connectionEvent.input_id,
        connectionEvent.output_class, connectionEvent.input_class);

      // consider the connection was canceled
      this.onConnectionCanceled();
      return;
    }

    const newConnection = this.currentLayer.saveUserConnectionAdded(outputNode, inputNode, outputPort, inputPort);
    if (connectionEvent) {
      this.workflowEvent$.next({
        action: 'addConnection',
        connection: newConnection,
        protocolId: this.currentLayer.object.id
      });
    }
  }

  private onConnectionRemoved(connectionEvent: ConnectionEvent): void {
    // if the connection was already deleted, we don't need to do anything
    // this happened when the removeConnection is called and the connection was deleted by code not user
    const connection = this.currentLayer.findConnectionByConnectionEvent(connectionEvent);
    if (connection) {
      if(this.mode !== 'report'){
        this.currentLayer.saveUserConnectionRemoved(connection);

        this.workflowEvent$.next({
          action: 'deleteConnection',
          connection: connection,
          protocolId: this.currentLayer.object.id
        });
      } else {
        this.currentLayer.addConnection(connection);
      }

    }
  }

  private emitConnectionSelected(connectionEvent: ConnectionEvent): void {
    const connectionIndex: number = this.currentLayer.findConnectionIndexByConnectionEvent(connectionEvent);
    if (connectionIndex >= 0) {
      this.connectionSelected$.next(this.currentLayer.connections[connectionIndex]);
    }
  }

  public findConnection(outputNodeId: string, inputNodeId: string,
                        outputPortName: string, inputPortName: string): PrWorkflowConnection {
    for (const layer of this.layers) {
      const connection = layer.findConnection(outputNodeId, inputNodeId, outputPortName, inputPortName);
      if (connection != null) {
        return connection;
      }
    }
    return null;
  }

  //////////////////// OTHER ///////////////////////

  public setMode(mode: PrWorkflowMode): void {
    this.mode = mode;
    if(mode === 'report'){
      mode = 'edit';
    }
    this.editor.editor_mode = mode === 'edit' ? 'edit' : 'view';
  }

  public getMode(): PrWorkflowMode {
    return this.mode;
  }

  public getWorkflowEvent$(): Observable<PrWorkflowEvent> {
    return this.workflowEvent$.asObservable();
  }

  public destroy(): void {
    this.connectionSelected$.complete();
    this.currentLayer$.complete();
    this.workflowEvent$.complete();
  }
}
