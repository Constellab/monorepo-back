import {LabWorkflowNode} from './lab-workflow-node.class';
import {LabWorkflowConnection} from './lab-workflow-connection.class';
import {LabWorkflowPort} from './lab-workflow-port.class';
import Drawflow, {ConnectionEvent, ConnectionStartEvent} from 'drawflow';
import {LabWorkflowNodeProcess} from './lab-workflow-node-process.class';
import {LabFlowManager} from '../../../../lab-core/model/global/lab-connection.class';

/**
 * One layer of the workflow, it contains the list of nodes
 */
export class LabWorkflowLayer {

  public readonly children: Record<string, LabWorkflowLayer> = {};

  public readonly nodes: LabWorkflowNode<any>[] = [];

  public readonly connections: LabWorkflowConnection[] = [];

  constructor(private readonly editor: Drawflow,
              // generated unique id of the layer
              public readonly id: string,
              public readonly name: string,
              // Flow object corresponding to this layer
              public readonly object: LabFlowManager,
              public readonly parentLayer: LabWorkflowLayer) {
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


  public addConnection(connection: LabWorkflowConnection): void {
    this.connections.push(connection);
    this.editor.addConnection(connection.outputNode.nodeId, connection.inputNode.nodeId,
      connection.outputPort.drawFlowName, connection.inputPort.drawFlowName);
  }

  // add the connection to the local list
  public saveConnection(event: ConnectionEvent): void {
    // only add the connection if it doesn't exist
    if (this.findConnection(event) == null) {
      const outputNode: LabWorkflowNode<any> = this.findNodeWithId(event.output_id);
      const inputNode: LabWorkflowNode<any> = this.findNodeWithId(event.input_id);


      // todo voir le null
      const workflowConnection: LabWorkflowConnection = new LabWorkflowConnection(outputNode, inputNode,
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

  public findConnection(connectionEvent: ConnectionEvent): LabWorkflowConnection {
    const connectionIndex: number = this.findConnectionIndex(connectionEvent);
    return connectionIndex >= 0 ? this.connections[connectionIndex] : null;
  }

  public findConnectionIndex(connectionEvent: ConnectionEvent): number {
    return this.connections.findIndex(c =>
      c.outputNode.nodeId === connectionEvent.output_id && c.inputNode.nodeId === connectionEvent.input_id &&
      c.outputPort.drawFlowName === connectionEvent.output_class && c.inputPort.drawFlowName === connectionEvent.input_class);
  }

  ///////////////////////// OTHER //////////////////////////

  public createSubLayer(layerId: string, name: string, title: string, object: LabFlowManager): LabWorkflowLayer {
    const subLayer: LabWorkflowLayer = new LabWorkflowLayer(this.editor, layerId, title, object, this);
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
