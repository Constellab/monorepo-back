import Drawflow, {ConnectionEvent, ConnectionStartEvent} from 'drawflow';
import {PrWorkflowNode} from './pr-workflow-node.class';
import {PrWorkflowConnection} from './pr-workflow-connection.class';
import {PrFlowManager} from './pr-connection.class';
import {PrWorkflowPort} from './pr-workflow-port.class';

export class PrWorkflowLayer {
  public readonly id: string;

  public readonly children: Record<string, PrWorkflowLayer> = {};

  public readonly nodes: PrWorkflowNode<any>[] = [];

  public readonly connections: PrWorkflowConnection[] = [];

  constructor(private readonly editor: Drawflow,
              // generated unique id of the layer
              public readonly name: string,
              // Flow object corresponding to this layer
              public object: PrFlowManager,
              public readonly parentLayer: PrWorkflowLayer) {

    this.id = object.id;
  }

  // function to call when this layer is selected
  // if node exists in this layer we reset their port color
  public selectLayer(): void {
    this.resetPortColors();
  }


  ///////////////////////////// NODE ////////////////////////////////

  public addNode(node: PrWorkflowNode<any>): void {
    this.nodes.push(node);
    this.createAndInitNode(node);

    // update the pr flow object
    if (this.object.getNodes()[node.nodeName] == null) {
      this.object.addNode(node.currentObject)
    }
  }

  public findNodeWithId(nodeId: string): PrWorkflowNode<any> {
    return this.findNode((node) => node.nodeId === nodeId);
  }

  public findNodeWithName(nodeName: string): PrWorkflowNode<any> {
    return this.findNode((node) => node.nodeName === nodeName);
  }

  public findNode(predicate: (node: PrWorkflowNode<any>) => boolean): PrWorkflowNode<any> {
    return this.nodes.find((node) => predicate(node));
  }

  public removeNode(nodeId: string): PrWorkflowNode<any> | undefined {
    // remove the node in the local array
    const index: number = this.nodes.findIndex((node) => node.nodeId === nodeId);
    if (index >= 0) {
      const node: PrWorkflowNode<any> = this.nodes[index];
      this.nodes.splice(index, 1);

      // update the pr flow object
      this.object.removeNode(node.nodeName);
      return node;
    } else {
      console.error('Couldn\'t find node with id ' + nodeId);
      return null;
    }
  }

  // this method is triggered when the connection is created by program
  public addConnection(connection: PrWorkflowConnection): void {
    this.connections.push(connection);
    this.editor.addConnection(connection.outputNode.nodeId, connection.inputNode.nodeId,
      connection.outputPort.drawFlowName,
      connection.inputPort.drawFlowName);
  }

  // this method is triggered when the user manually creates a connection
  public saveUserConnectionAdded(outputNode: PrWorkflowNode<any>, inputNode: PrWorkflowNode<any>,
                                 outputPort: PrWorkflowPort, inputPort: PrWorkflowPort): PrWorkflowConnection | undefined {

    this.resetPortColors();

    // only add the connection if it doesn't exist
    if (this.findConnection(outputNode.nodeId, inputNode.nodeId, outputPort.name, inputPort.name) != null) return null;

    const workflowConnection: PrWorkflowConnection = new PrWorkflowConnection(outputNode, inputNode,
      outputPort, inputPort);
    this.connections.push(workflowConnection);
    return workflowConnection;
  }

  ///////////////////////////////// CONNECTION //////////////////////////////////////

  // add the connection in the local array and in the editor

  // this method is triggered when the connection is deleted by program
  public removeConnection(connection: PrWorkflowConnection): PrWorkflowConnection | undefined {
    const removedConnection = this.saveUserConnectionRemoved(connection);

    if (removedConnection) {
      this.editor.removeSingleConnection(removedConnection.outputNode.nodeId, removedConnection.inputNode.nodeId,
        removedConnection.outputPort.drawFlowName, removedConnection.inputPort.drawFlowName);
      return removedConnection;
    }
    return null;
  }

  // add the connection to the local list

  // this method is triggered when the user manually remove a connection
  public saveUserConnectionRemoved(connection: PrWorkflowConnection): PrWorkflowConnection | undefined {

    const connectionIndex: number = this.findConnectionIndex(connection.outputNode.nodeId,
      connection.inputNode.nodeId, connection.outputPort.name, connection.inputPort.name);
    if (connectionIndex >= 0) {
      const connection: PrWorkflowConnection = this.connections[connectionIndex];
      this.connections.splice(connectionIndex, 1);
      return connection;
    }
    return null;
  }

  // remove the connection from the local array and in the editor

  public findConnectionByConnectionEvent(connectionEvent: ConnectionEvent): PrWorkflowConnection {
    const index = this.findConnectionIndexByConnectionEvent(connectionEvent);
    return this.connections[index];
  }

  // remove the connection from the local list

  public findConnectionIndexByConnectionEvent(connectionEvent: ConnectionEvent): number {
    // check if input is avaiprle for the node
    const inputNode: PrWorkflowNode<any> = this.findNodeWithId(connectionEvent.input_id);
    const outputNode: PrWorkflowNode<any> = this.findNodeWithId(connectionEvent.output_id);
    const inputPort: PrWorkflowPort = inputNode.findInputPortByDrawflowName(connectionEvent.input_class);
    const outputPort: PrWorkflowPort = outputNode.findOutputPortByDrawflowName(connectionEvent.output_class);

    return this.findConnectionIndex(outputNode.nodeId, inputNode.nodeId,
      outputPort.name, inputPort.name);
  }

  public findConnection(outputNodeId: string, inputNodeId: string,
                        outputPortName: string, inputPortName: string): PrWorkflowConnection {
    const connectionIndex: number = this.findConnectionIndex(outputNodeId, inputNodeId, outputPortName, inputPortName);
    return connectionIndex >= 0 ? this.connections[connectionIndex] : null;
  }

  public findConnectionIndex(outputNodeId: string, inputNodeId: string,
                             outputPortName: string, inputPortName: string): number {
    return this.connections.findIndex(c =>
      c.outputNode.nodeId === outputNodeId && c.inputNode.nodeId === inputNodeId &&
      c.outputPort.name === outputPortName && c.inputPort.name === inputPortName);
  }

  public createSubLayer(name: string, title: string, object: PrFlowManager): PrWorkflowLayer {
    const subLayer: PrWorkflowLayer = new PrWorkflowLayer(this.editor, title, object, this);
    this.children[name] = subLayer;
    return subLayer;
  }

  public getLayerHierarchy(): PrWorkflowLayer[] {
    const layers: PrWorkflowLayer[] = [this];
    if (this.parentLayer == null) {
      return layers;
    }

    return [...this.parentLayer.getLayerHierarchy(), ...layers];
  }

  ///////////////////////// OTHER //////////////////////////

  public onConnectionStarted(event: ConnectionStartEvent): void {
    const outputNode: PrWorkflowNode<any> = this.findNodeWithId(event.output_id);
    const port: PrWorkflowPort = outputNode.findOutputPortByDrawflowName(event.output_class);
    this.disableIncompatiblePorts(outputNode, port);
  }

  public resetPortColors(): void {
    for (const node of this.nodes) {
      node.initPortColors();
    }
  }

  public destroy(): void {
    // destroy all nodes
    for (const node of this.nodes) {
      node.destroy();
    }

    // destroy all child layer
    for (const key in this.children) {
      this.children[key].destroy();
    }
  }

  /**
   * Create the node in the editor and init those values
   */
  private createAndInitNode(node: PrWorkflowNode<any>): void {
    const nodeId: number = this.editor.addNode(node.title,
      node.countInputs(), node.countOutputs(), node.x,
      node.y, node.getClassName(), {}, node.getHTML(), false);

    // set the nodeId in workflow node
    node.initNode(nodeId.toString(), (id: string) => this.editor.getNodeFromId(id));
  }

  /**
   * Disable incompatible port when a new connection starts
   */
  private disableIncompatiblePorts(outputNode: PrWorkflowNode<any>, port: PrWorkflowPort): void {
    for (const node of this.nodes) {
      node.disableIncompatibleInputPort(port);
      if (node.nodeId !== outputNode.nodeId) {
        node.disableOutputPorts();
      }
    }
  }
}
