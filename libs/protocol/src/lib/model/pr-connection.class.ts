import {TdIOSpec, TdResourceTypeDTO} from '@monorepo/technical-doc';
import {PrTypingName} from './pr-typing-name.class';
import {PrIO} from './pr-io.class';

export interface PrConnectionPart {

  getNodeName(): string;

  setNodeName(name: string): void;

  getPort(): string;

  getNode(): PrNode;

  // called by the ConnectionManager to set the node
  setNode(node: PrNode): void;
}


export interface PrConnection {
  from: PrConnectionPart;
  to: PrConnectionPart;
}

export abstract class PrNode {

  id: string;

  // inputConnections automatically set by the ConnectionManager
  inputConnections: Record<string, PrConnectionPart> = {};

  // outputConnections automatically set by the ConnectionManager
  outputConnections: Record<string, PrConnectionPart[]> = {};

  // name automatically set by the ConnectionManager
  name: string;

  setInput(connectionPart: PrConnectionPart): void {
    if (this.inputConnections == null) {
      this.inputConnections = {};
    }
    this.inputConnections[connectionPart.getPort()] = connectionPart;
  }

  addOutput(connectionPart: PrConnectionPart): void {
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

const resourceSpec: TdResourceTypeDTO = {
  typing_name: PrTypingName.model.resource,
  human_name: 'Resource',
  short_description: 'Any resource',
  brick_version: ''
};

/**
 * Specific node for the interface that only has one output port
 * Its name correspond to the port name
 */
export class PrInterfaceNode extends PrNode {
  // name of the single output port set by the ConnectionManager
  portName: string;

  // types supported by the port
  portType: TdIOSpec;

  /**
   * Return a new interface with specs equals to resource
   */
  public static newGenericInterface(portName: string): PrInterfaceNode {
    const node = new PrInterfaceNode();
    node.portName = portName;
    node.name = portName;
    node.portType = {
      resource_types: [resourceSpec],
      human_name: '',
      short_description: ''
    };
    return node;
  }
}

/**
 * Specific node for the outerface that only has one input port
 * Its name correspond to the port name
 */
export class PrOuterfaceNode extends PrNode {
  // name of the single input port set by the ConnectionManager
  portName: string;

  // types supported by the port
  portType: TdIOSpec;

  /**
   * Return a new outerface with specs equals to resource
   */
  public static newGenericInterface(portName: string): PrOuterfaceNode {
    const node = new PrOuterfaceNode();
    node.portName = portName;
    node.name = portName;
    node.portType = {
      resource_types: [resourceSpec],
      human_name: '',
      short_description: ''
    };
    return node;
  }
}


export interface PrFlowManager {

  id: string;

  // list of interface as nodes
  interfaceNodes: Record<string, PrNode>;

  // list of outerface as nodes
  outerfaceNodes: Record<string, PrNode>;

  getConnections(): PrConnection[];

  getNodes(): Record<string, PrNode>;

  getInputSpecs(): Record<string, PrIO>;

  getOutputSpecs(): Record<string, PrIO>;

  getInterfacesConnections(): Record<string, PrConnection>;

  getOuterfacesConnections(): Record<string, PrConnection>;

  addNode(node: PrNode): void;

  removeNode(nodeName: string): void;

}

export class PrFlow<T extends PrFlowManager> {

  constructor(public object: T) {
    this.initConnectionsAndNodes();
  }

  public getAllNodes(): Record<string, PrNode> {
    return Object.assign({}, this.object.getNodes(), this.object.interfaceNodes, this.object.outerfaceNodes);
  }

  public getAllNodesArray(): PrNode[] {
    const nodes: Record<string, PrNode> = this.getAllNodes();
    return Object.keys(nodes).map(key => nodes[key]);
  }


  // return the nodes that do not have any inputs
  public getRootNodes(): PrNode[] {
    const roots: PrNode[] = [];

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
  public getAllConnections(): PrConnection[] {
    const interfaces: Record<string, PrConnection> = this.object.getInterfacesConnections();
    const interfacesConnections: PrConnection[] = Object.keys(interfaces).map(key => interfaces[key]);
    const outerfaces: Record<string, PrConnection> = this.object.getOuterfacesConnections();
    const outerfacesConnections: PrConnection[] = Object.keys(outerfaces).map(key => outerfaces[key]);
    return [...this.object.getConnections(), ...interfacesConnections, ...outerfacesConnections];
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
   * Set the node objects in the ConnectionPart to directly have access to BioxNode object in part
   */
  private initConnectionNodes(): void {
    const nodes: Record<string, PrNode> = this.getAllNodes();
    for (const connection of this.getAllConnections()) {

      // init from node
      const fromNode: PrNode = nodes[connection.from.getNodeName()];
      if (fromNode == null) {
        console.error(`Can't find from node with name ${connection.from.getNodeName()}. Connection : `, connection);
      }

      connection.from.setNode(fromNode);

      // init to node
      const toNode: PrNode = nodes[connection.to.getNodeName()];
      if (toNode == null) {
        console.error(`Can't find to node with name ${connection.to.getNodeName()}. Connection : `, connection);
      }
      connection.to.setNode(toNode);
    }
  }

  /**
   * Init the node inputs and outputs connections
   */
  private initNodesInputsOutputs(): void {
    for (const connection of this.getAllConnections()) {
      const from: PrNode = connection.from.getNode();
      from.addOutput(connection.to);

      const to: PrNode = connection.to.getNode();
      to.setInput(connection.from);
    }
  }

  // init the name of the classic nodes
  private initNodeNames(): void {
    const nodes: Record<string, PrNode> = this.getAllNodes();
    for (const name of Object.keys(nodes)) {
      nodes[name].name = name;
    }
  }

  /**
   * Create empty interface nodes
   */
  private initInterfaceNodes(): void {
    this.object.interfaceNodes = {};
    const specs: Record<string, PrIO> = this.object.getInputSpecs();
    if (specs == null) {
      return;
    }

    for (const interfacePortName of Object.keys(specs)) {
      const node: PrInterfaceNode = new PrInterfaceNode();

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
      const outputNode: PrConnection = this.object.getInterfacesConnections()[interfacePortName];
      outputNode.from.setNodeName(interfaceNodeName);
    }
  }

  /**
   * Create empty outerface nodes
   */
  private initOuterfaceNodes(): void {
    this.object.outerfaceNodes = {};
    const specs: Record<string, PrIO> = this.object.getOutputSpecs();
    if (specs == null) {
      return;
    }

    for (const outerfacePortName of Object.keys(specs)) {
      const node: PrInterfaceNode = new PrOuterfaceNode();
      // create a unique name to avoid duplicate node name
      const outerfaceNodeName: string = 'o_' + outerfacePortName;

      // init the port name as the interface name
      node.portName = outerfacePortName;
      node.portType = specs[outerfacePortName].specs;
      node.name = outerfaceNodeName;

      // save the node under the right name
      this.object.outerfaceNodes[outerfaceNodeName] = node;

      // override the input node name to point to the outerface node (using the generate node name)
      const inputNode: PrConnection = this.object.getOuterfacesConnections()[outerfacePortName];
      inputNode.to.setNodeName(outerfaceNodeName);
    }
  }

}
