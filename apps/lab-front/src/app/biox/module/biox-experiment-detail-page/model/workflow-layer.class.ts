import {WorkflowNode} from './workflow-node.class';
import * as Drawflow from 'drawflow';
import {ConnectionEvent} from 'drawflow';
import {WorkflowConnection} from './workflow-connection.class';

/**
 * One layer of the workflow, it contains the list of nodes
 */
export class WorkflowLayer<T extends WorkflowNode<any>> {

  public readonly nodes: T[] = [];

  public readonly connections: WorkflowConnection[] = [];

  constructor(private readonly editor: Drawflow,
              public readonly id: string,
              public readonly name: string,
              public readonly parentLayer: WorkflowLayer<T>) {
  }


  ///////////////////////////// NODE ////////////////////////////////

  public addNode(node: T): void {
    this.nodes.push(node);
    const nodeId: number = this.editor.addNode(node.title,
      node.nbInputs, node.nbOutputs, node.initialPosX,
      node.initialPosY, '', {}, node.html, false);

    // set the nodeId in workflow node
    node.initNode(nodeId.toString(), (id: string) => this.editor.getNodeFromId(id));
  }

  // todo add node on node creation

  public findNodeWithId(nodeId: string): T {
    return this.findNode((node) => node.nodeId === nodeId);
  }

  public findNodeWithName(nodeName: string): T {
    return this.findNode((node) => node.nodeName === nodeName);
  }

  public findNode(predicate: (node: T) => boolean): T {
    return this.nodes.find((node) => predicate(node));
  }

  public onNodeRemoved(nodeId: string): void {
    // remove the node in the local array
    const index: number = this.nodes.findIndex((node) => node.nodeId === nodeId);
    if (index >= 0) {
      this.nodes.splice(index, 1);
    } else {
      console.error('Couldn\'t find node with id ' + nodeId);
    }
  }

  ///////////////////////////////// CONNECTION //////////////////////////////////////


  public addConnection(connection: WorkflowConnection): void {
    this.connections.push(connection);
    this.editor.addConnection(connection.outputNode.nodeId, connection.inputNode.nodeId,
      connection.outputName, connection.inputName);
  }

  // add the connection to the local list
  public saveConnection(event: ConnectionEvent): void {
    // only add the connection if it doesn't exist
    if (this.findConnection(event.output_id, event.input_id, event.output_class, event.input_class) == null) {
      const outputNode: T = this.findNodeWithId(event.output_id);
      const inputNode: T = this.findNodeWithId(event.input_id);
      // todo voir le null
      const workflowConnection: WorkflowConnection = new WorkflowConnection(outputNode, inputNode,
        event.output_class, event.input_class, null);
      this.connections.push(workflowConnection);
    }
  }

  public removeConnection(event: ConnectionEvent): void {
    const connectionIndex: number = this.findConnectionIndex(event.output_id, event.input_id, event.output_class, event.input_class);
    if (connectionIndex >= 0) {
      this.connections.splice(connectionIndex, 1);
    }
  }

  public findConnection(outputNodeId: string, inputNodeId: string, outputName: string, inputName: string): WorkflowConnection {
    const connectionIndex: number = this.findConnectionIndex(outputNodeId, inputNodeId, outputName, inputName);
    return connectionIndex >= 0 ? this.connections[connectionIndex] : null;
  }

  public findConnectionIndex(nodeOutputId: string, nodeInputId: string, outputName: string, inputName: string): number {
    return this.connections.findIndex(c => c.outputNode.nodeId === nodeOutputId && c.inputNode.nodeId === nodeInputId &&
      c.outputName === outputName && c.inputName === inputName);
  }


  ///////////////////////// OTHER //////////////////////////

  public getLayerHierarchy(): WorkflowLayer<T>[] {
    const layers: WorkflowLayer<T>[] = [this];
    if(this.parentLayer == null){
      return layers;
    }

    return [...this.parentLayer.getLayerHierarchy(), ...layers];
  }


}
