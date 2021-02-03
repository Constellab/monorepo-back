import {LabEntity} from './lab-entity.entity';
import {BioxFlowJob} from '../entities/biox-flow.entity';

// todo rename class and methods
export interface BioxConnectionPart {

  getNodeName(): string;

  getPort(): string;

  getNode(): BioxNode;

  // called by the ConnectionManager to set the node
  setNode(node: BioxNode): void;
}

/**
 * Type of the connection
 * node --> connection between 2 nodes
 * interface --> representing an interface or an outerface of the manager
 * outerface --> representing an outerface of the manager
 */
export type BioxConnectionType = 'node' | 'interface' | 'outerface';

export interface BioxConnection {
  from: BioxConnectionPart;
  to: BioxConnectionPart

  getType(): BioxConnectionType;
}

export abstract class BioxNode extends LabEntity {

  // inputs automatically set by the ConnectionManager
  inputs: Record<string, BioxConnectionPart> = {};

  // outputs automatically set by the ConnectionManager
  outputs: Record<string, BioxConnectionPart[]> = {};

  // name automatically set by the ConnectionManager
  name: string;

  setInput(connectionPart: BioxConnectionPart): void {
    if (this.inputs == null) {
      this.inputs = {};
    }
    this.inputs[connectionPart.getPort()] = connectionPart;
  }

  addOutput(connectionPart: BioxConnectionPart): void {
    if (this.outputs == null) {
      this.outputs = {};
    }

    if (this.outputs[connectionPart.getPort()] == null) {
      this.outputs[connectionPart.getPort()] = [];
    }

    this.outputs[connectionPart.getPort()].push(connectionPart);
  }

  public getInputsCount(): number {
    return (Object.keys(this.inputs).length);
  }
}

/**
 * Specific node for the interface that only has one output port
 * It's name correspond to the port name
 */
export class BioxInterfaceNode extends BioxNode {
  // name of the single output port set by the BioxConnectionManager
  portName: string;
}

/**
 * Specific node for the outerface that only has one input port
 * It's name correspond to the port name
 */
export class BioxOuterfaceNode extends BioxNode {
  // name of the single input port set by the BioxConnectionManager
  portName: string;
}


export abstract class BioxConnectionManager extends LabEntity {

  abstract getAllConnections(): BioxConnection[];

  abstract getNodes(): Record<string, BioxNode>;

  abstract getInterfaces(): Record<string, BioxConnection>;

  abstract getOuterfaces(): Record<string, BioxConnection>;

  // list of interface as nodes
  interfaceNodes: Record<string, BioxNode>;

  // list of outerface as nodes
  outerfaceNodes: Record<string, BioxNode>;

  public getAllNodes(): Record<string, BioxNode> {
    return Object.assign(this.getNodes(), this.interfaceNodes, this.outerfaceNodes);
  }

  public getAllNodesArray(): BioxNode[] {
    const nodes: Record<string, BioxNode> = this.getNodes();
    return Object.keys(nodes).map(key => nodes[key]);
  }

  // return the nodes that do not have any inputs
  public getRootNodes(): BioxNode[] {
    const roots: BioxNode[] = [];

    for (const node of this.getAllNodesArray()) {
      if (node.getInputsCount() === 0) {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * return the connections between nodes (not the interfaces nor the outerfaces)
   */
  public getNodesConnections(): BioxConnection[] {
    return this.getAllConnections().filter(connection => connection.getType() === 'node');
  }

  ////////////////////////////// INIT METHODS /////////////////////////////////

  public initConnectionsAndNodes(): void {
    this.initInterfaceNodes();
    this.initOuterfaceNodes();
    this.initNodeNames();
    this.initConnectionNodes();
    this.initNodesInputsOutputs();
  }

  /**
   * Set the node objects in the BioxConnectionPart to directly have access to BioxNode object in part
   */
  private initConnectionNodes(): void {
    const nodes: Record<string, BioxNode> = this.getAllNodes();
    for (const connection of this.getAllConnections()) {

      // TODO improve this management
      // used to replace the port name to make the connection works
      // because it has a strange formatting and name
      if (connection.getType() === 'interface') {
        const job: BioxFlowJob = connection.from as any;
        job.process.instanceName = 'i_' + job.process.port;
      }

      // init from node
      const fromNode: BioxNode = nodes[connection.from.getNodeName()];
      connection.from.setNode(fromNode);

      // init to node
      const toNode: BioxNode = nodes[connection.to.getNodeName()];
      connection.to.setNode(toNode);
    }
  }

  /**
   * Init the node inputs and outputs connections
   */
  private initNodesInputsOutputs(): void {
    for (const connection of this.getAllConnections()) {
      const from: BioxNode = connection.from.getNode();
      from.addOutput(connection.to);

      const to: BioxNode = connection.to.getNode();
      to.setInput(connection.from);
    }
  }

  // init the name of the classic nodes
  private initNodeNames(): void {
    const nodes: Record<string, BioxNode> = this.getAllNodes();
    for (const name of Object.keys(nodes)) {
      nodes[name].name = name;
    }
  }

  /**
   * Create empty interface nodes
   */
  private initInterfaceNodes(): void {
    this.interfaceNodes = {};
    for (const interfaceName of Object.keys(this.getInterfaces())) {
      const node: BioxInterfaceNode = new BioxInterfaceNode();
      // init the port name as the interface name
      node.portName = interfaceName;
      // create a unique name to avoid duplicate with output node
      this.interfaceNodes['i_' + interfaceName] = node;
    }
  }

  /**
   * Create empty outerface nodes
   */
  private initOuterfaceNodes(): void {
    this.outerfaceNodes = {};
    for (const outerfaceName of Object.keys(this.getOuterfaces())) {
      const node: BioxInterfaceNode = new BioxOuterfaceNode();
      // init the port name as the interface name
      node.portName = outerfaceName;
      // create a unique name to avoid duplicate with input node
      this.outerfaceNodes['o_' + outerfaceName] = node;
    }
  }

}
