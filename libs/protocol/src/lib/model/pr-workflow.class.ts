import {PrWorkflowNode} from './node/pr-workflow-node.class';
import {PrWorkflowConnection} from './pr-workflow-connection.class';
import Drawflow, {ConnectionEvent, ConnectionStartEvent} from 'drawflow';
import {PrWorkflowLayer} from './pr-workflow-layer.class';
import {BehaviorSubject, map, Observable, Subject} from 'rxjs';
import {NgZone} from '@angular/core';
import {PrWorkflowPort} from './pr-workflow-port.class';
import {PrWorkflowNodeProtocol} from './node/pr-workflow-node-protocol.class';
import {PrWorkflowNodeProcess} from './node/pr-workflow-node-process.class';

export type PrWorkflowMode = 'edit' | 'readOnly';

export type PrWorkflowEvent =
  PrWorkflowDeleteNodeEvent
  | PrWorkflowConnectionEvent
  | PrWorkflowNodeMovedEvent;

export interface PrWorkflowDeleteNodeEvent {
  action: 'deleteNode';
  node: PrWorkflowNode;
  connections: PrWorkflowConnection[]; // list of connections that were also deleted
  protocolId: string;
}

export interface PrWorkflowConnectionEvent {
  action: 'addConnection' | 'deleteConnection';
  connection: PrWorkflowConnection;
  protocolId: string;
}

export interface PrWorkflowNodeMovedEvent {
  action: 'nodeMoved';
  node: PrWorkflowNode;
  protocolId: string;
}


/**
 * Class to manage Drawflow
 */
export class PrWorkflow {

  private editor: Drawflow;

  private readonly layers: PrWorkflowLayer[];
  private currentLayer$: BehaviorSubject<PrWorkflowLayer>;

  private mode: PrWorkflowMode;

  private workflowEvent$: Subject<PrWorkflowEvent> = new Subject<PrWorkflowEvent>();

  constructor(layer: PrWorkflowLayer,
              mode: PrWorkflowMode = 'edit',
              private ngZone: NgZone) {


    // set edit or readonly mode
    this.setMode(mode);

    // init layers
    this.layers = [layer];

    // init subject
    this.currentLayer$ = new BehaviorSubject<PrWorkflowLayer>(layer);
  }


  public start(element: HTMLElement): void {
    this.editor = new Drawflow(element);
    this.editor.zoom_value = 0.1;
    // use always edit mode
    this.editor.editor_mode = 'edit';

    // run the start outside angular to prevent all drawflow event from triggering change detection
    this.ngZone.runOutsideAngular(() => {
      this.editor.start();

      this.selectAndInitLayer(this.currentLayer);
    });


    this.initListeners();
  }

  private initListeners(): void {
    this.editor.on('connectionCreated',
      (connection) => this.ngZone.run(() => this.onConnectionCreated(connection)));

    this.editor.on('connectionRemoved',
      (connection) => this.ngZone.run(() => this.onConnectionRemoved(connection)));

    this.editor.on('nodeRemoved', node => this.ngZone.run(() => this.onNodeRemoved(node)));


    this.editor.on('connectionStart',
      event => this.ngZone.run(() => this.onConnectionStarted(event)));

    this.editor.on('connectionCancel',
      () => this.ngZone.run(() => this.onConnectionCanceled()));

    this.editor.on('nodeMoved',
      (node) => this.ngZone.run(() => this.onNodeMoved(node))
    );
  }

  ////////////////////// LAYERS ///////////////////////////
  get currentLayer(): PrWorkflowLayer {
    return this.currentLayer$.value;
  }

  public selectRootLayer(): void {
    this.selectLayer(this.getRootLayer().id);
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

    this.selectAndInitLayer(layer);
  }

  private selectAndInitLayer(layer: PrWorkflowLayer): void {
    // update the current layer before initializing the layer
    this.currentLayer$.next(layer);

    if (this.isDrawflowReady()) {
      // if the added layer is not initialized, initialize it
      const initializeModule = !layer.isDrawflowReady();

      if (initializeModule) {
        this.editor.addModule(layer.drawflowId);
      }

      // update the drawflow module before initialized the layer
      this.editor.changeModule(layer.drawflowId);

      if (initializeModule) {
        layer.init(this.editor);
      }
    }

    layer.initOnSelect();
  }

  public addLayer(layer: PrWorkflowLayer, parentLayerId: string = null, selectLayer: boolean = false): void {
    if (parentLayerId != null) {
      layer.parentLayer = this.findLayerWithId(parentLayerId);
    }
    this.layers.push(layer);

    if (this.isDrawflowReady() && selectLayer) {
      this.selectLayer(layer.id);
    }

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

  public getRootLayer(): PrWorkflowLayer {
    return this.layers[0];
  }

  public loadSubProtocolLayer(protocol: PrWorkflowNodeProtocol, selectLayer: boolean): void {
    const currentLayerId = this.currentLayer.id;

    protocol.markSubLayerAsLoading();
    protocol.getSubLayer$().subscribe({
      next: layer => {
        if (!this.hasLayer(layer.id)) {
          this.addLayer(layer, currentLayerId, selectLayer);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  ////////////////////// NODE ///////////////////////////

  private onNodeRemoved(nodeId: number): void {
    const layer = this.currentLayer;
    const node: PrWorkflowNode = layer.removeNode(nodeId.toString());
    if (node) {
      this.workflowEvent$.next({
        action: 'deleteNode',
        node: node,
        connections: layer.findConnectionsByNode(node.nodeName),
        protocolId: this.currentLayer.id
      });
    }
  }

  public findNodeByDrawflowId(drawflowNodeId: string): PrWorkflowNode {
    for (const layer of this.layers) {
      const node = layer.findNodeByDrawflowId(drawflowNodeId);
      if (node != null) {
        return node;
      }
    }
    return null;
  }

  public findNodeByProcessId(processId: string): PrWorkflowNodeProcess {
    for (const layer of this.layers) {
      const node = layer.findNodeByProcessId(processId);
      if (node != null) {
        return node;
      }
    }
    return null;
  }

  public findNodeByName(layerId: string, nodeName: string): PrWorkflowNode {
    const layer = this.findLayerWithId(layerId);
    if (layer == null) return null;
    return layer.findNodeByName(nodeName);
  }

  /**
   * Find (in the current layer) the node with the given name
   * We must search in current layer because in multiple layer we can have the same
   */
  public findNodeByNameInCurrentLayer(nodeName: string): PrWorkflowNode {
    return this.currentLayer.findNodeByName(nodeName);
  }

  // refresh the node position in the object
  private onNodeMoved(nodeId: string): void {
    const layer = this.currentLayer;
    const node = layer.findNodeByDrawflowId(nodeId.toString());
    if (node) {
      node.refreshCoords();
      this.workflowEvent$.next({
        action: 'nodeMoved',
        node: node,
        protocolId: layer.id
      });
    }
  }

  public getAllProtocolNodes(): PrWorkflowNodeProtocol[] {
    const nodes: PrWorkflowNodeProtocol[] = [];
    for (const layer of this.layers) {
      nodes.push(...layer.getSubProtocolNodes());
    }
    return nodes;
  }

  ////////////////////// CONNECTION ///////////////////////////

  private onConnectionCreated(connectionEvent: ConnectionEvent): void {
    // check if input is available for the node
    const inputNode: PrWorkflowNode = this.findNodeByDrawflowId(connectionEvent.input_id);
    const outputNode: PrWorkflowNode = this.findNodeByDrawflowId(connectionEvent.output_id);
    const inputPort: PrWorkflowPort = inputNode.findInputPortByDrawflowName(connectionEvent.input_class);
    const outputPort: PrWorkflowPort = outputNode.findOutputPortByDrawflowName(connectionEvent.output_class);

    // if the connection already exists, we don't need to do anything
    // this happened when the add_connection is called and the connection is added by code not user
    if (this.findConnection(outputNode.drawflowId, inputNode.drawflowId, outputPort.name, inputPort.name) != null) {
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
        protocolId: this.currentLayer.id
      });
    }
  }

  private onConnectionRemoved(connectionEvent: ConnectionEvent): void {
    // if the connection was already deleted, we don't need to do anything
    // this happened when the removeConnection is called and the connection was deleted by code not user
    const connection = this.currentLayer.findConnectionByConnectionEvent(connectionEvent);
    if (connection) {

      const layer = this.currentLayer;
      // for readonly mode cancel the deletion
      if (this.mode === 'readOnly') {
        layer.addConnection(connection);
        return;
      }

      // This is used to prevent emitting an deleteConnection event when a node with connections is deleted
      // The deleteConnection event is triggered before the delete node event
      // So we wait a bit to make the deleteNode event before the deleteConnection event
      // Then if one of the connected node was deleted, we don't emit because this mean the connection
      // was deleted because a node was deleted
      setTimeout(() => {
        layer.saveUserConnectionRemoved(connection);
        if (layer.findNodeByName(connection.inputNode.nodeName) == null
          || layer.findNodeByName(connection.outputNode.nodeName) == null) {
          return;
        }

        this.workflowEvent$.next({
          action: 'deleteConnection',
          connection: connection,
          protocolId: this.currentLayer.id
        });
      }, 0);
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

  private isDrawflowReady(): boolean {
    return this.editor != null;
  }

  public setMode(mode: PrWorkflowMode): void {
    this.mode = mode;
  }


  public getWorkflowEvent$(): Observable<PrWorkflowEvent> {
    return this.workflowEvent$.asObservable();
  }

  /**
   * Method to cancel all drawflow information
   */
  public deInitDrawflow(): void {
    this.editor?.clear();
    this.editor = null;
    for (const layer of this.layers) {
      layer.deInitDrawflow();
    }
  }

  public destroy(): void {
    this.deInitDrawflow();
    this.currentLayer$.complete();
    this.workflowEvent$.complete();
    for (const layer of this.layers) {
      layer.destroy();
    }
  }
}
