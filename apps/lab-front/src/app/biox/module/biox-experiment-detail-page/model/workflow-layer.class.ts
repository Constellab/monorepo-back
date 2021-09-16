import {WorkflowNode} from './workflow-node.class';
import {WorkflowConnection} from './workflow-connection.class';
import {WorkflowPort} from './workflow-port.class';
import Drawflow, {ConnectionEvent, ConnectionStartEvent} from 'drawflow';
import {WorkflowNodeProcess} from './workflow-node-process.class';
import {BioxFlowManager} from '../../../../core/model/global/biox-connection.class';

/**
 * One layer of the workflow, it contains the list of nodes
 */
export class WorkflowLayer {

  public readonly children: Record<string, WorkflowLayer> = {};

  public readonly nodes: WorkflowNode<any>[] = [];

  public readonly connections: WorkflowConnection[] = [];

  constructor(private readonly editor: Drawflow,
              // generated unique id of the layer
              public readonly id: string,
              public readonly name: string,
              // Flow object corresponding to this layer
              public readonly object: BioxFlowManager,
              public readonly parentLayer: WorkflowLayer) {
  }

  // function to call when this layer is selected
  // if node exists in this layer we reset their port color
  public selectLayer(): void {
    this.resetPortColors();
  }


  ///////////////////////////// NODE ////////////////////////////////

  public addNode(node: WorkflowNode<any>): void {
    this.nodes.push(node);
    this.createAndInitNode(node);
  }

  public findNodeWithId(nodeId: string): WorkflowNode<any> {
    return this.findNode((node) => node.nodeId === nodeId);
  }

  public findNodeWithName(nodeName: string): WorkflowNode<any> {
    return this.findNode((node) => node.nodeName === nodeName);
  }

  public findNode(predicate: (node: WorkflowNode<any>) => boolean): WorkflowNode<any> {
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

  /**
   * Create the node in the editor and init those values
   */
  private createAndInitNode(node: WorkflowNode<any>): void {
    const nodeId: number = this.editor.addNode(node.title,
      node.countInputs(), node.countOutputs(), node.initialCoordX,
      node.initialCoordY, node.className, {}, node.html, false);

    // set the nodeId in workflow node
    node.initNode(nodeId.toString(), (id: string) => this.editor.getNodeFromId(id));
  }

  /**
   * Disable incompatible port when a new connection starts
   */
  private disableIncompatiblePorts(outputNode: WorkflowNode<any>, port: WorkflowPort): void {
    for (const node of this.nodes) {
      node.disableIncompatibleInputPort(port);
      if (node.nodeId !== outputNode.nodeId) {
        node.disableOutputPorts();
      }
    }
  }

  public getProcessNodes(): WorkflowNodeProcess[] {
    return this.nodes.filter(node => node instanceof WorkflowNodeProcess) as WorkflowNodeProcess[];
  }

  ///////////////////////////////// CONNECTION //////////////////////////////////////


  public addConnection(connection: WorkflowConnection): void {
    this.connections.push(connection);
    this.editor.addConnection(connection.outputNode.nodeId, connection.inputNode.nodeId,
      connection.outputPort.drawFlowName, connection.inputPort.drawFlowName);
  }

  // add the connection to the local list
  public saveConnection(event: ConnectionEvent): void {
    // only add the connection if it doesn't exist
    if (this.findConnection(event) == null) {
      const outputNode: WorkflowNode<any> = this.findNodeWithId(event.output_id);
      const inputNode: WorkflowNode<any> = this.findNodeWithId(event.input_id);


      // todo voir le null
      const workflowConnection: WorkflowConnection = new WorkflowConnection(outputNode, inputNode,
        outputNode.findOutputPortByDrawflowName(event.output_class), inputNode.findInputPortByDrawflowName(event.input_class), null);
      this.connections.push(workflowConnection);
    }
    this.resetPortColors();
  }

  public removeConnection(event: ConnectionEvent): void {
    const connectionIndex: number = this.findConnectionIndex(event);
    if (connectionIndex >= 0) {
      this.connections.splice(connectionIndex, 1);
    }
  }

  public findConnection(connectionEvent: ConnectionEvent): WorkflowConnection {
    const connectionIndex: number = this.findConnectionIndex(connectionEvent);
    return connectionIndex >= 0 ? this.connections[connectionIndex] : null;
  }

  public findConnectionIndex(connectionEvent: ConnectionEvent): number {
    return this.connections.findIndex(c =>
      c.outputNode.nodeId === connectionEvent.output_id && c.inputNode.nodeId === connectionEvent.input_id &&
      c.outputPort.drawFlowName === connectionEvent.output_class && c.inputPort.drawFlowName === connectionEvent.input_class);
  }

  ///////////////////////// OTHER //////////////////////////

  public createSubLayer(layerId: string, name: string, title: string, object: BioxFlowManager): WorkflowLayer {
    const subLayer: WorkflowLayer = new WorkflowLayer(this.editor, layerId, title, object, this);
    this.children[name] = subLayer;
    return subLayer;
  }

  public getLayerHierarchy(): WorkflowLayer[] {
    const layers: WorkflowLayer[] = [this];
    if (this.parentLayer == null) {
      return layers;
    }

    return [...this.parentLayer.getLayerHierarchy(), ...layers];
  }

  public onConnectionStarted(event: ConnectionStartEvent): void {
    const outputNode: WorkflowNode<any> = this.findNodeWithId(event.output_id);
    const port: WorkflowPort = outputNode.findOutputPortByDrawflowName(event.output_class);
    this.disableIncompatiblePorts(outputNode, port);
  }

  public resetPortColors(): void {
    for (const node of this.nodes) {
      node.initPortColors();
    }
  }

}
