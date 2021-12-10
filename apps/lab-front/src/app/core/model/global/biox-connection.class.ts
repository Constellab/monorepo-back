import {BioxIO, BioxIOSpec, BioxIOSpecResourceType} from '../entities/biox-io.entity';
import {Exclude} from 'class-transformer';
import {constTypingNameResource} from '../entities/biox-typing-name.py';
import {LabBaseEntityWithUser} from '../entities/lab-user.entity';

export interface BioxConnectionPart {

  getNodeName(): string;

  setNodeName(name: string): void;

  getPort(): string;

  getBioxNode(): BioxNode;

  // called by the ConnectionManager to set the node
  setBioxNode(node: BioxNode): void;
}


export interface BioxConnection {
  from: BioxConnectionPart;
  to: BioxConnectionPart;
}

export abstract class BioxNode extends LabBaseEntityWithUser {

  // inputConnections automatically set by the ConnectionManager
  @Exclude()
  inputConnections: Record<string, BioxConnectionPart> = {};

  // outputConnections automatically set by the ConnectionManager
  @Exclude()
  outputConnections: Record<string, BioxConnectionPart[]> = {};

  // name automatically set by the ConnectionManager
  name: string;

  setInput(connectionPart: BioxConnectionPart): void {
    if (this.inputConnections == null) {
      this.inputConnections = {};
    }
    this.inputConnections[connectionPart.getPort()] = connectionPart;
  }

  addOutput(connectionPart: BioxConnectionPart): void {
    if (this.outputConnections == null) {
      this.outputConnections = {};
    }

    if (this.outputConnections[connectionPart.getPort()] == null) {
      this.outputConnections[connectionPart.getPort()] = [];
    }

    this.outputConnections[connectionPart.getPort()].push(connectionPart);
  }

  public getInputsCount(): number {
    return (Object.keys(this.inputConnections).length);
  }
}

const resourceSpec: BioxIOSpecResourceType = {
  typing_name: constTypingNameResource,
  human_name: 'Resource',
  short_description: 'Any resource'
};

/**
 * Specific node for the interface that only has one output port
 * It's name correspond to the port name
 */
export class BioxInterfaceNode extends BioxNode {
  // name of the single output port set by the BioxConnectionManager
  portName: string;

  // types supported by the port
  portType: BioxIOSpec;

  /**
   * Return a new interface with specs equals to resource
   */
  public static newGenericInterface(portName: string): BioxInterfaceNode {
    const node = new BioxInterfaceNode();
    node.portName = portName;
    node.name = portName;
    node.portType = {
      resource_types: [resourceSpec],
      type_io: 'TypeIO'
    };
    return node;
  }
}

/**
 * Specific node for the outerface that only has one input port
 * It's name correspond to the port name
 */
export class BioxOuterfaceNode extends BioxNode {
  // name of the single input port set by the BioxConnectionManager
  portName: string;

  // types supported by the port
  portType: BioxIOSpec;

  /**
   * Return a new outerface with specs equals to resource
   */
  public static newGenericInterface(portName: string): BioxOuterfaceNode {
    const node = new BioxOuterfaceNode();
    node.portName = portName;
    node.name = portName;
    node.portType = {
      resource_types: [resourceSpec],
      type_io: 'TypeIO'
    };
    return node;
  }
}


export interface BioxFlowManager {

  // list of interface as nodes
  interfaceNodes: Record<string, BioxNode>;

  // list of outerface as nodes
  outerfaceNodes: Record<string, BioxNode>;

  getConnections(): BioxConnection[];

  getNodes(): Record<string, BioxNode>;

  getInputSpecs(): Record<string, BioxIO>;

  getOutputSpecs(): Record<string, BioxIO>;

  getInterfacesConnections(): Record<string, BioxConnection>;

  getOuterfacesConnections(): Record<string, BioxConnection>;

}

export class BioxFlow<T extends BioxFlowManager> {

  constructor(public object: T) {
    this.initConnectionsAndNodes();
  }

  public getAllNodes(): Record<string, BioxNode> {
    return Object.assign(this.object.getNodes(), this.object.interfaceNodes, this.object.outerfaceNodes);
  }

  public getAllNodesArray(): BioxNode[] {
    const nodes: Record<string, BioxNode> = this.object.getNodes();
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
   * return the connections between nodes with interfaces and outerfaces connections
   */
  public getAllConnections(): BioxConnection[] {
    const interfaces: Record<string, BioxConnection> = this.object.getInterfacesConnections();
    const interfacesConnections: BioxConnection[] = Object.keys(interfaces).map(key => interfaces[key]);
    const outerfaces: Record<string, BioxConnection> = this.object.getOuterfacesConnections();
    const outerfacesConnections: BioxConnection[] = Object.keys(outerfaces).map(key => outerfaces[key]);
    return [...this.object.getConnections(), ...interfacesConnections, ...outerfacesConnections];
  }


  ////////////////////////////// INIT METHODS /////////////////////////////////

  public initConnectionsAndNodes(): void {
    this.initInterfaceNodes();
    this.initOuterfaceNodes();
    // this.initNodeNames();
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
      if (fromNode == null) {
        console.error(`Can't find from node with name ${connection.from.getNodeName()}. Connection : `, connection);
      }

      connection.from.setBioxNode(fromNode);

      // init to node
      const toNode: BioxNode = nodes[connection.to.getNodeName()];
      if (toNode == null) {
        console.error(`Can't find to node with name ${connection.to.getNodeName()}. Connection : `, connection);
      }
      connection.to.setBioxNode(toNode);
    }
  }

  /**
   * Init the node inputs and outputs connections
   */
  private initNodesInputsOutputs(): void {
    for (const connection of this.getAllConnections()) {
      const from: BioxNode = connection.from.getBioxNode();
      from.addOutput(connection.to);

      const to: BioxNode = connection.to.getBioxNode();
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
    this.object.interfaceNodes = {};
    const specs: Record<string, BioxIO> = this.object.getInputSpecs();
    if (specs == null) {
      return;
    }

    for (const interfacePortName of Object.keys(specs)) {
      const node: BioxInterfaceNode = new BioxInterfaceNode();

      // create a unique name to avoid duplicate node name
      const interfaceNodeName: string = 'i_' + interfacePortName;

      // init the port name as the interface name
      node.portName = interfacePortName;
      node.portType = specs[interfacePortName].specs;
      // set the name of the interface node
      node.name = interfaceNodeName;

      // save the node under the right name
      this.object.interfaceNodes[interfaceNodeName] = node;

      // override the output node name to point to the interface node (using the generate node name)
      const outputNode: BioxConnection = this.object.getInterfacesConnections()[interfacePortName];
      outputNode.from.setNodeName(interfaceNodeName);
    }
  }

  /**
   * Create empty outerface nodes
   */
  private initOuterfaceNodes(): void {
    this.object.outerfaceNodes = {};
    const specs: Record<string, BioxIO> = this.object.getOutputSpecs();
    if (specs == null) {
      return;
    }

    for (const outerfacePortName of Object.keys(specs)) {
      const node: BioxInterfaceNode = new BioxOuterfaceNode();
      // create a unique name to avoid duplicate node name
      const outerfaceNodeName: string = 'o_' + outerfacePortName;

      // init the port name as the interface name
      node.portName = outerfacePortName;
      node.portType = specs[outerfacePortName].specs;
      node.name = outerfaceNodeName;

      // save the node under the right name
      this.object.outerfaceNodes[outerfaceNodeName] = node;

      // override the input node name to point to the outerface node (using the generate node name)
      const inputNode: BioxConnection = this.object.getOuterfacesConnections()[outerfacePortName];
      inputNode.to.setNodeName(outerfaceNodeName);
    }
  }

}
