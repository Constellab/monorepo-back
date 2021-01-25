import {WorkflowNode} from './workflow-node.class';
import * as Drawflow from 'drawflow';
import {WorkflowConnection} from './workflow-connection.class';

/**
 * One layer of the workflow, it contains the list of nodes
 */
export class WorkflowLayer<T extends WorkflowNode<any>> {

  public readonly nodes: T[] = [];

  constructor(private readonly editor: Drawflow,
              public readonly id: string,
              public readonly name: string,
              public readonly parentLayer: WorkflowLayer<T>) {
  }

  public addNode(node: T): void {
    this.nodes.push(node);
    const nodeId: number = this.editor.addNode(node.title,
      node.nbInputs, node.nbOutputs, node.initialPosX,
      node.initialPosY, '', {}, node.html, false);

    // set the nodeId in workflow node
    node.initNode(nodeId.toString(), (id: string) => this.editor.getNodeFromId(id));
  }

  public findNodeWithId(nodeId: string): T {
    return this.findNode((node) => node.nodeId === nodeId);
  }

  public findNodeWithName(nodeName: string): T {
    return this.findNode((node) => node.nodeName === nodeName);
  }

  public findNode(predicate: (node: T) => boolean): T {
    return this.nodes.find((node) => predicate(node));
  }


  public addConnection(connection: WorkflowConnection<any>): void {
    this.editor.addConnection(connection.outputNode.nodeId, connection.inputNode.nodeId,
      connection.outputName, connection.inputName);
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

  public getLayerHierarchy(): WorkflowLayer<T>[] {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let layer: WorkflowLayer<T> = this;
    const hierarchy: WorkflowLayer<T>[] = [layer];
    while (layer.parentLayer != null) {
      layer = layer.parentLayer;
      hierarchy.unshift(layer);
    }
    return hierarchy;
  }


}
