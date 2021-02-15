import {LabEntity} from './lab-entity.entity';
import {BioxFlowInterface} from '../entities/biox-inteface.entity';

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

  // types supported by the port
  portType: string[];
}

/**
 * Specific node for the outerface that only has one input port
 * It's name correspond to the port name
 */
export class BioxOuterfaceNode extends BioxNode {
  // name of the single input port set by the BioxConnectionManager
  portName: string;

  // types supported by the port
  portType: string[];
}


export abstract class BioxConnectionManager extends LabEntity {

  abstract getConnections(): BioxConnection[];

  abstract getNodes(): Record<string, BioxNode>;

  abstract getInputSpecs(): Record<string, string[]>;

  abstract getOutputSpecs(): Record<string, string[]>;

  abstract getInterfacesConnections(): Record<string, BioxFlowInterface>;

  abstract getOuterfacesConnections(): Record<string, BioxFlowInterface>;

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
   * todo delete when pulled
   */
  public getNodesConnections(): BioxConnection[] {
    return this.getConnections().filter(connection => connection.getType() === 'node');
  }

  /**
   * return the connections between nodes with interfaces and outerfaces connections
   */
  public getAllConnections(): BioxConnection[] {
    const interfaces: Record<string, BioxFlowInterface> = this.getInterfacesConnections();
    const interfacesConnections: BioxConnection[] = Object.keys(interfaces).map(key => interfaces[key]);
    const outerfaces: Record<string, BioxFlowInterface> = this.getOuterfacesConnections();
    const outerfacesConnections: BioxConnection[] = Object.keys(outerfaces).map(key => outerfaces[key]);
    return [...this.getNodesConnections(), ...interfacesConnections, ...outerfacesConnections];
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
    const specs: Record<string, string[]> = this.getInputSpecs();
    if (specs == null) {
      return;
    }

    for (const interfaceName of Object.keys(specs)) {
      const node: BioxInterfaceNode = new BioxInterfaceNode();
      // init the port name as the interface name
      node.portName = interfaceName;
      node.portType = specs[interfaceName];

      // create a unique name to avoid duplicate node name
      const interfaceNodeName: string = 'i_' + interfaceName;
      this.interfaceNodes[interfaceNodeName] = node;

      // override the output node name to point to the interface node (using the generate node name)
      const outputNode: BioxFlowInterface = this.getInterfacesConnections()[interfaceName];
      outputNode.from.nodeName = interfaceNodeName;
    }
  }

  /**
   * Create empty outerface nodes
   */
  private initOuterfaceNodes(): void {
    this.outerfaceNodes = {};
    const specs: Record<string, string[]> = this.getOutputSpecs();
    if (specs == null) {
      return;
    }

    for (const outerfaceName of Object.keys(specs)) {
      const node: BioxInterfaceNode = new BioxOuterfaceNode();
      // init the port name as the interface name
      node.portName = outerfaceName;
      node.portType = specs[outerfaceName];


      // create a unique name to avoid duplicate node name
      const outerfaceNodeName: string = 'o_' + outerfaceName;

      this.outerfaceNodes[outerfaceNodeName] = node;

      // override the input node name to point to the outerface node (using the generate node name)
      const inputNode: BioxFlowInterface = this.getOuterfacesConnections()[outerfaceName];
      inputNode.to.nodeName = outerfaceNodeName;
    }
  }

}
