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
      if (this.connections.find(connection => connection.inputNode.nodeName === node.nodeName) == undefined) {
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

  public addInterface(interfaceName: string, nodeName: string, portName: string): void {
    const node = this.findNode(nodeName);

    if (node == null) {
      console.error('[PrProtocol] can\'t find node with name ' + nodeName);
      return;
    }
    const port = node.findInputPortByName(portName);
    const interfaceNode = new PrWorkflowNodeInterface({
      // append 'i_' to name to make it unique with outerface
      name: 'i_' + interfaceName,
      portName: port.name,
      portType: port.specs
    });
    this.interfaces.push(interfaceNode);

    // add to connection of the interface
    const connection = new PrWorkflowConnection(interfaceNode, node,
      interfaceNode.getPort(), port);
    this.connections.push(connection);
  }

  public addOuterface(outerfaceName: string, nodeName: string, portName: string): void {
    const node = this.findNode(nodeName);

    if (node == null) {
      console.error('[PrProtocol] can\'t find node with name ' + nodeName);
      return;
    }
    const port = node.findOutputPortByName(portName);
    const outerfaceNode = new PrWorkflowNodeOuterface({
      // append 'o_' to name to make it unique with interface
      name: 'o_' + outerfaceName,
      portName: port.name,
      portType: port.specs
    });
    this.outerfaces.push(outerfaceNode);

    // add to connection of the outerface
    const connection = new PrWorkflowConnection(node, outerfaceNode,
      port, outerfaceNode.getPort());
    this.connections.push(connection);
  }

}
