import {WorkflowNode} from './workflow-node.class';
import * as Drawflow from 'drawflow';
import {ConnectionEvent} from 'drawflow';

export class Workflow<T> {

  private readonly editor: Drawflow;

  private readonly nodes: WorkflowNode<T>[] = [];

  constructor(private element: HTMLElement) {
    this.editor = new Drawflow(element);

    this.editor.on('connectionCreated',
      (connection) => this.onConnectionCreated(connection));

    this.editor.on('connectionRemoved',
      (connection) => this.onConnectionRemoved(connection));

    this.editor.on('nodeRemoved', node => this.onNodeRemoved(node));

    this.editor.addModule('test');
  }

  public start(): void {
    this.editor.start();
  }

  public setData(data: any): void {
    this.editor.drawflow = data;
    // this.editor.import(data);
  }

  public addNode(node: WorkflowNode<T>): void {
    this.nodes.push(node);
    const nodeId: number = this.editor.addNode(node.name,
      node.nbInputs, node.nbOutputs, node.posX,
      node.posY, '', {}, node.html, false);

    // set the nodeId in workflow node
    node.nodeId = nodeId.toString();
    console.log(this.editor.drawflow);
  }

  public findNodeWithHTMLId(nodeId: string): WorkflowNode<T> {
    return this.nodes.find((node) => node.htmlId === nodeId);
  }

  public findNodeWithId(nodeId: string): WorkflowNode<T> {
    return this.nodes.find((node) => node.nodeId === nodeId);
  }

  private onConnectionCreated(connection: ConnectionEvent): void {
    console.log(connection);
  }

  private onConnectionRemoved(connection: ConnectionEvent): void {
    console.log(connection);
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
