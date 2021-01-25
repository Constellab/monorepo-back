import {WorkflowNode} from './workflow-node.class';
import * as Drawflow from 'drawflow';
import {ConnectionEvent} from 'drawflow';
import {WorkflowConnection} from './workflow-connection.class';
import {WorkflowLayer} from './workflow-layer.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export class Workflow<T extends WorkflowNode<any>> {

  private readonly editor: Drawflow;

  private readonly layers: WorkflowLayer<T>[];
  private currentLayer$: BehaviorSubject<WorkflowLayer<T>>;

  private nodeGeneration: number = 0;

  constructor(private element: HTMLElement) {
    this.editor = new Drawflow(element);

    // init layers
    const currentLayer: WorkflowLayer<T> = new WorkflowLayer<T>(this.editor, 'Home', 'Experiment', null);
    this.layers = [currentLayer];

    // init subject
    this.currentLayer$ = new BehaviorSubject<WorkflowLayer<T>>(currentLayer);

    this.editor.on('connectionCreated',
      (connection) => this.onConnectionCreated(connection));

    this.editor.on('connectionRemoved',
      (connection) => this.onConnectionRemoved(connection));

    this.editor.on('nodeRemoved', node => this.onNodeRemoved(node));
  }


  get currentLayer(): WorkflowLayer<T> {
    return this.currentLayer$.value;
  }


  public start(): void {
    this.editor.start();
  }

  public setData(data: any): void {
    this.editor.drawflow = data;
    // this.editor.import(data);
  }

  public addNode(node: T): void {
    this.currentLayer.addNode(node);
  }

  public findNodeWithId(nodeId: string): T {
    for (const layer of this.layers) {
      const node = layer.findNodeWithId(nodeId);
      if (node != null) {
        return node;
      }
    }
    return null;
  }

  public findNodeWithName(nodeName: string): T {
    for (const layer of this.layers) {
      const node = layer.findNodeWithName(nodeName);
      if (node != null) {
        return node;
      }
    }
    return null;
  }

  public findNode(predicate: (node: T) => boolean): T {
    for (const layer of this.layers) {
      const node = layer.findNode(predicate);
      if (node != null) {
        return node;
      }
    }
    return null;
  }


  public addConnection(connection: WorkflowConnection<any>): void {
    this.currentLayer.addConnection(connection);
  }


  private onConnectionCreated(connection: ConnectionEvent): void {
    // check if input is available for the node
    const node: T = this.findNodeWithId(connection.input_id);

    // check if the input is available
    if (!node.inputIsValid(connection.input_class)) {
      console.log('Input not available');
      // remove the connection
      this.editor.removeSingleConnection(connection.output_id, connection.input_id,
        connection.output_class, connection.input_class);
    }
  }

  private onConnectionRemoved(connection: ConnectionEvent): void {
    console.log(connection);
  }

  private onNodeRemoved(nodeId: string): void {
    this.currentLayer$.value.onNodeRemoved(nodeId);
  }

  public selectLayer(layerId: string): void {
    // do nothing if this is the current layer
    if (this.currentLayer.id === layerId) {
      return;
    }

    const layer: WorkflowLayer<T> = this.findLayerWithId(layerId);
    if (!layerId) {
      throw new Error(`The layer with id ${layerId} doesn't exist`);
    }

    this.editor.changeModule(layerId);
    // update the current layer
    this.currentLayer$.next(layer);
  }

  public createSubLayerIfNotExists(layerId: string, name: string): void {
    if (this.findLayerWithId(layerId) == null) {
      this.editor.addModule(layerId);
      this.layers.push(new WorkflowLayer<T>(this.editor, layerId, name, this.currentLayer));
    }

    this.selectLayer(layerId);
  }

  public hasLayer(layerId: string): boolean {
    return this.findLayerWithId(layerId) != null;
  }

  // return the layer with the id
  private findLayerWithId(layerId: string): WorkflowLayer<T> {
    return this.layers.find(layer => layer.id === layerId);
  }


  public getCurrentLayerHierarchy(): Observable<WorkflowLayer<T>[]> {
    return this.currentLayer$.asObservable().pipe(
      map(layer => layer.getLayerHierarchy())
    );
  }

  public generateNodeName(): string {
    return `n${this.nodeGeneration++}`;
  }

}
