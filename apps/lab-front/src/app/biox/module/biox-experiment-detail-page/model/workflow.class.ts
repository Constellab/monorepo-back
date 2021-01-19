import {WorkflowNode} from './workflow-node.class';
import * as Drawflow from 'drawflow';
import {ConnectionEvent} from 'drawflow';
import {WorkflowConnection} from './workflow-connection.class';

export class Workflow<T extends WorkflowNode<any>, H> {

  private readonly editor: Drawflow;

  public readonly nodes: T[] = [];

  constructor(private element: HTMLElement) {
    this.editor = new Drawflow(element);

    this.editor.on('connectionCreated',
      (connection) => this.onConnectionCreated(connection));

    this.editor.on('connectionRemoved',
      (connection) => this.onConnectionRemoved(connection));

    this.editor.on('nodeRemoved', node => this.onNodeRemoved(node));
  }


  public start(): void {
    this.editor.start();
  }

  public setData(data: any): void {
    this.editor.drawflow = data;
    // this.editor.import(data);
  }

  public addNode(node: T): void {
    this.nodes.push(node);
    const nodeId: number = this.editor.addNode(node.name,
      node.nbInputs, node.nbOutputs, node.initialPosX,
      node.initialPosY, '', {}, node.html, false);

    // set the nodeId in workflow node
    node.nodeId = nodeId.toString();
    console.log(this.editor.drawflow);
  }

  public findNodeWithHTMLId(nodeId: string): T {
    return this.nodes.find((node) => node.htmlId === nodeId);
  }

  public findNodeWithId(nodeId: string): T {
    return this.nodes.find((node) => node.nodeId === nodeId);
  }

  public addConnection(connection: WorkflowConnection<H>): void {
    this.editor.addConnection(connection.outputNode.nodeId, connection.inputNode.nodeId,
      connection.outputName, connection.inputName);
  }


  private onConnectionCreated(connection: ConnectionEvent): void {
    // check if input is available for the node
    const node: T = this.findNodeWithId(connection.input_id);

    // check if the input is available
    if (node.inputIsAvailable(connection.input_class)) {
      // mark the input as used
      node.markInputAsUnavailable(connection.input_class);
    } else {
      console.log('Input not available');
      // remove the connection
      this.editor.removeSingleConnection(connection.output_id, connection.input_id,
        connection.output_class, connection.input_class);
    }
  }

  private onConnectionRemoved(connection: ConnectionEvent): void {
    // mark the correspond node input as available
    const node: T = this.findNodeWithId(connection.input_id);
    node.markInputAsAvailable(connection.input_class);
  }

  private onNodeRemoved(nodeId: string): void {
    // remove the node in the local array
    const index: number = this.nodes.findIndex((node) => node.nodeId === nodeId);
    if (index >= 0) {
      this.nodes.splice(index, 1);
    } else {
      console.error('Couldn\'t find node with id ' + nodeId);
    }
  }

  public switchModule(): void {
    this.editor.changeModule(this.editor.module === 'Home' ? 'test' : 'Home');
  }
}
