import {WorkflowNode} from './workflow-node.class';
import * as Drawflow from 'drawflow';
import {ConnectionEvent} from 'drawflow';
import {WorkflowConnection} from './workflow-connection.class';
import {WorkflowLayer} from './workflow-layer.class';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {WorkflowConnectionSelected} from './workflow-event.class';
import {WorkflowPort} from './workflow-port.class';

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
  private connectionSelected$: Subject<WorkflowConnectionSelected> = new Subject<WorkflowConnectionSelected>();

  private mode: WorkflowMode;

  constructor(private element: HTMLElement, mode: WorkflowMode = 'edit') {
    this.editor = new Drawflow(element);

    // set edit or readonly mode
    this.setMode(mode);

    // init layers
    const currentLayer: WorkflowLayer = new WorkflowLayer(this.editor, 'Home', 'Experiment', null);
    this.layers = [currentLayer];

    // init subject
    this.currentLayer$ = new BehaviorSubject<WorkflowLayer>(currentLayer);

    this.editor.on('connectionCreated',
      (connection) => this.onConnectionCreated(connection));

    this.editor.on('connectionRemoved',
      (connection) => this.onConnectionRemoved(connection));

    this.editor.on('nodeRemoved', node => this.onNodeRemoved(node));

    this.editor.on('click', event => this.onClickEvent(event));
  }


  public start(): void {
    this.editor.start();
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
  }

  public createSubLayerIfNotExists(layerId: string, name: string): void {
    if (this.findLayerWithId(layerId) == null) {
      this.editor.addModule(layerId);
      this.layers.push(new WorkflowLayer(this.editor, layerId, name, this.currentLayer));
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

  ////////////////////// NODE ///////////////////////////
  public addNode(node: WorkflowNode<any>): void {
    this.currentLayer.addNode(node);
  }


  private onNodeRemoved(nodeId: string): void {
    this.currentLayer$.value.onNodeRemoved(nodeId);
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
    if (!inputNode.inputIsAvailable(connection.input_class) ||
      !inputPort.isCompatible(outputPort)) {
      console.log('Input not available');
      // remove the connection
      this.editor.removeSingleConnection(connection.output_id, connection.input_id,
        connection.output_class, connection.input_class);
      return;
    }

    this.currentLayer.saveConnection(connection);
  }

  private onConnectionRemoved(connection: ConnectionEvent): void {
    this.currentLayer.removeConnection(connection);
  }

  public onConnectionSelected(): Observable<WorkflowConnectionSelected> {
    return this.connectionSelected$.asObservable();
  }

  //////////////////// OTHER ///////////////////////

  private onClickEvent(ev: MouseEvent): void {
    const targets: HTMLElement[] = ev.composedPath() as any;

    for (const target of targets) {
      // we stop if we reach the container
      if (target === this.element) {
        return;
      }

      this.checkIfConnectionSelected(target, ev);
    }
  }

  /**
   * Method to check if a click is on a connection and find the connection
   */
  private checkIfConnectionSelected(target: HTMLElement, ev: MouseEvent): void {
    if (target.tagName === 'svg') {
      let outputNodeId: string;
      let inputNodeId: string;
      let outputName: string;
      let inputName: string;

      // find the connection based on classes on element
      // example of classes "connection node_in_node-3 node_out_node-2 output_1 input_1"
      for (const className of target.getAttribute('class').split(' ')) {
        if (className.startsWith('node_out_node-')) {
          outputNodeId = className.substr(14);
        } else if (className.startsWith('node_in_node-')) {
          inputNodeId = className.substr(13);
        } else if (className.startsWith('output_')) {
          outputName = className;
        } else if (className.startsWith('input_')) {
          inputName = className;
        }
      }

      // try to find the connection with information
      const connection: WorkflowConnection =
        this.currentLayer.findConnection(outputNodeId, inputNodeId, outputName, inputName);

      // if we found the connection, emit the event
      if (connection) {
        this.connectionSelected$.next({
          connection: connection,
          event: ev
        });
      }
    }
  }

  public setMode(mode: WorkflowMode): void {
    this.editor.editor_mode = mode === 'edit' ? 'edit' : 'fixed';
    this.mode = mode;
  }

  public getMode(): WorkflowMode {
    return this.mode;
  }
}
