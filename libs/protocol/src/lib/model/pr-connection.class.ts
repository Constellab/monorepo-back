import {TdIOSpec} from '@monorepo/technical-doc';
import {PrWorkflowNode} from './node/pr-workflow-node.class';
import {PrWorkflowNodeInterface} from './node/pr-workflow-node-interface.class';
import {PrWorkflowNodeOuterface} from './node/pr-workflow-node-outerface.class';
import {PrWorkflowConnection} from './pr-workflow-connection.class';


/**
 * Specific node for the interface that only has one output port
 * Its name correspond to the port name
 */
export interface PrInterfaceNode {

  name: string;
  // name of the single output port set by the ConnectionManager
  portName: string;

  // types supported by the port
  portType: TdIOSpec;
}

/**
 * Specific node for the outerface that only has one input port
 * Its name correspond to the port name
 */
export type PrOuterfaceNode = PrInterfaceNode;


export class PrProtocolFlow {

  nodes: PrWorkflowNode[] = [];
  connections: PrWorkflowConnection[] = [];

  interfaces: PrWorkflowNodeInterface[] = [];
  outerfaces: PrWorkflowNodeOuterface[] = [];

  constructor(public readonly id: string,
              public readonly name: string,
              public readonly title: string) {
  }

  public getAllNodes(): PrWorkflowNode[] {
    return [...this.nodes, ...this.interfaces, ...this.outerfaces];
  }

  // return the nodes that do not have any inputs
  public getRootNodes(): PrWorkflowNode[] {
    const roots: PrWorkflowNode[] = [];

    for (const node of this.getAllNodes()) {
      // the nodes that are not connected to any other node (in input) are root nodes
      if(this.connections.find(connection => connection.inputNode.nodeName === node.nodeName) == undefined) {
        roots.push(node);
      }
    }

    return roots;
  }

  public getNextNodes(nodeName: string): PrWorkflowNode[] {
    const nextNodes: PrWorkflowNode[] = [];

    for (const connection of this.connections) {
      if (connection.outputNode.nodeName === nodeName) {
        nextNodes.push(connection.inputNode);
      }
    }

    return nextNodes;
  }

  public findNode(nodeName: string): PrWorkflowNode {
    return this.getAllNodes().find(node => node.nodeName === nodeName);
  }

}
