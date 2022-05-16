import {LabWorkflowNode} from './lab-workflow-node.class';
import {LabWorkflowConnection} from './lab-workflow-connection.class';
import {LabWorkflowPort} from './lab-workflow-port.class';
import Drawflow, {ConnectionEvent, ConnectionStartEvent} from 'drawflow';
import {LabWorkflowNodeProcess} from './lab-workflow-node-process.class';
import {LabFlow, LabFlowManager, LabNode} from '../../../../lab-core/model/global/lab-connection.class';
import {LabEntity} from '../../../../lab-core/model/global/lab-entity.entity';

/**
 * One layer of the workflow, it contains the list of nodes
 */
export class LabWorkflowLayer {

  public readonly id: string;

  public readonly children: Record<string, LabWorkflowLayer> = {};

  public readonly nodes: LabWorkflowNode<LabEntity>[] = [];

  public readonly connections: LabWorkflowConnection[] = [];

  constructor(private readonly editor: Drawflow,
              // generated unique id of the layer
              public readonly name: string,
              // Flow object corresponding to this layer
              public object: LabFlowManager,
              public readonly parentLayer: LabWorkflowLayer) {
    this.id = object.id;
  }

  // function to call when this layer is selected
  // if node exists in this layer we reset their port color
  public selectLayer(): void {
    this.resetPortColors();
  }


  ///////////////////////////// NODE ////////////////////////////////

  public addNode(node: LabWorkflowNode<any>): void {
    this.nodes.push(node);
    this.createAndInitNode(node);

    // update the lab flow object
    if(this.object.getNodes()[node.nodeName] == null){
      this.object.addNode(node.currentObject)
    }
  }

  public findNodeWithId(nodeId: string): LabWorkflowNode<any> {
    return this.findNode((node) => node.nodeId === nodeId);
  }

  public findNodeWithName(nodeName: string): LabWorkflowNode<any> {
    return this.findNode((node) => node.nodeName === nodeName);
  }

  public findNode(predicate: (node: LabWorkflowNode<any>) => boolean): LabWorkflowNode<any> {
    return this.nodes.find((node) => predicate(node));
  }

  public removeNode(nodeId: string): LabWorkflowNode<any> | undefined {
    // remove the node in the local array
    const index: number = this.nodes.findIndex((node) => node.nodeId === nodeId);
    if (index >= 0) {
      const node: LabWorkflowNode<any> = this.nodes[index];
      this.nodes.splice(index, 1);

      // update the lab flow object
      this.object.removeNode(node.nodeName);
      return node;
    } else {
      console.error('Couldn\'t find node with id ' + nodeId);
      return null;
    }
  }

  /**
   * Create the node in the editor and init those values
   */
  private createAndInitNode(node: LabWorkflowNode<any>): void {
    const nodeId: number = this.editor.addNode(node.title,
      node.countInputs(), node.countOutputs(), node.initialCoordX,
      node.initialCoordY, node.getClassName(), {}, node.getHTML(), false);

    // set the nodeId in workflow node
    node.initNode(nodeId.toString(), (id: string) => this.editor.getNodeFromId(id));
  }

  /**
   * Disable incompatible port when a new connection starts
   */
  private disableIncompatiblePorts(outputNode: LabWorkflowNode<any>, port: LabWorkflowPort): void {
    for (const node of this.nodes) {
      node.disableIncompatibleInputPort(port);
      if (node.nodeId !== outputNode.nodeId) {
        node.disableOutputPorts();
      }
    }
  }

  public getProcessNodes(): LabWorkflowNodeProcess[] {
    return this.nodes.filter(node => node instanceof LabWorkflowNodeProcess) as LabWorkflowNodeProcess[];
  }

  ///////////////////////////////// CONNECTION //////////////////////////////////////

  // add the connection in the local array and in the editor
  // this method is triggered when the connection is created by program
  public addConnection(connection: LabWorkflowConnection): void {
    this.connections.push(connection);
    this.editor.addConnection(connection.outputNode.nodeId, connection.inputNode.nodeId,
      connection.outputPort.drawFlowName, connection.inputPort.drawFlowName);
  }

  // add the connection to the local list
  // this method is triggered when the user manually creates a connection
  public saveUserConnectionAdded(outputNode: LabWorkflowNode<any>, inputNode: LabWorkflowNode<any>,
                                 outputPort: LabWorkflowPort, inputPort: LabWorkflowPort): LabWorkflowConnection | undefined {
    this.resetPortColors();

    // only add the connection if it doesn't exist
    if (this.findConnection(outputNode.nodeId, inputNode.nodeId, outputPort.name, inputPort.name) != null) return null;

    const workflowConnection: LabWorkflowConnection = new LabWorkflowConnection(outputNode, inputNode,
      outputPort, inputPort);
    this.connections.push(workflowConnection);
    return workflowConnection;
  }

  // remove the connection from the local array and in the editor
  // this method is triggered when the connection is deleted by program
  public removeConnection(connection: LabWorkflowConnection): LabWorkflowConnection | undefined {
    const removedConnection = this.saveUserConnectionRemoved(connection);

    if (removedConnection) {
      this.editor.removeSingleConnection(removedConnection.outputNode.nodeId, removedConnection.inputNode.nodeId,
        removedConnection.outputPort.drawFlowName, removedConnection.inputPort.drawFlowName);
      return removedConnection;
    }
    return null;
  }

  // remove the connection from the local list
  // this method is triggered when the user manually remove a connection
  public saveUserConnectionRemoved(connection: LabWorkflowConnection): LabWorkflowConnection | undefined {
    const connectionIndex: number = this.findConnectionIndex(connection.outputNode.nodeId,
      connection.inputNode.nodeId, connection.outputPort.name, connection.inputPort.name);
    if (connectionIndex >= 0) {
      const connection: LabWorkflowConnection = this.connections[connectionIndex];
      this.connections.splice(connectionIndex, 1);
      return connection;
    }
    return null;
  }

  public findConnectionByConnectionEvent(connectionEvent: ConnectionEvent): LabWorkflowConnection {
    const index = this.findConnectionIndexByConnectionEvent(connectionEvent);
    return this.connections[index];
  }

  public findConnectionIndexByConnectionEvent(connectionEvent: ConnectionEvent): number {
    // check if input is available for the node
    const inputNode: LabWorkflowNode<any> = this.findNodeWithId(connectionEvent.input_id);
    const outputNode: LabWorkflowNode<any> = this.findNodeWithId(connectionEvent.output_id);
    const inputPort: LabWorkflowPort = inputNode.findInputPortByDrawflowName(connectionEvent.input_class);
    const outputPort: LabWorkflowPort = outputNode.findOutputPortByDrawflowName(connectionEvent.output_class);

    return this.findConnectionIndex(outputNode.nodeId, inputNode.nodeId,
      outputPort.name, inputPort.name);
  }

  public findConnection(outputNodeId: string, inputNodeId: string,
                        outputPortName: string, inputPortName: string): LabWorkflowConnection {
    const connectionIndex: number = this.findConnectionIndex(outputNodeId, inputNodeId, outputPortName, inputPortName);
    return connectionIndex >= 0 ? this.connections[connectionIndex] : null;
  }

  public findConnectionIndex(outputNodeId: string, inputNodeId: string,
                             outputPortName: string, inputPortName: string): number {
    return this.connections.findIndex(c =>
      c.outputNode.nodeId === outputNodeId && c.inputNode.nodeId === inputNodeId &&
      c.outputPort.name === outputPortName && c.inputPort.name === inputPortName);
  }

  ///////////////////////// OTHER //////////////////////////

  public createSubLayer(name: string, title: string, object: LabFlowManager): LabWorkflowLayer {
    const subLayer: LabWorkflowLayer = new LabWorkflowLayer(this.editor, title, object, this);
    this.children[name] = subLayer;
    return subLayer;
  }

  public getLayerHierarchy(): LabWorkflowLayer[] {
    const layers: LabWorkflowLayer[] = [this];
    if (this.parentLayer == null) {
      return layers;
    }

    return [...this.parentLayer.getLayerHierarchy(), ...layers];
  }

  public onConnectionStarted(event: ConnectionStartEvent): void {
    const outputNode: LabWorkflowNode<any> = this.findNodeWithId(event.output_id);
    const port: LabWorkflowPort = outputNode.findOutputPortByDrawflowName(event.output_class);
    this.disableIncompatiblePorts(outputNode, port);
  }

  public resetPortColors(): void {
    for (const node of this.nodes) {
      node.initPortColors();
    }
  }

  /**
   * Refresh the layer node objects with flow object
   */
  public refreshObject(flow: LabFlow<LabFlowManager>): void{
    // update the layer object
    this.object = flow.object;
    for (const workflowNode of this.nodes) {
      const node: LabNode = flow.getAllNodesArray().find(n => n.id === workflowNode.currentObject.id);

      if (node == null) continue;
      workflowNode.updateObject(node);
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

}
