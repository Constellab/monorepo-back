import {LabEntity} from './lab-entity.entity';

// todo rename class and methods
export interface BioxConnectionPart {

  getNodeName(): string;

  getPort(): string;

  getNode(): BioxNode;

  setNode(node: BioxNode): void;
}

export interface BioxConnection {
  from: BioxConnectionPart;
  to: BioxConnectionPart
}

export abstract class BioxNode extends LabEntity {

  inputs: Record<string, BioxConnectionPart> = {};

  outputs: Record<string, BioxConnectionPart[]> = {};

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

export abstract class BioxConnectionManager extends LabEntity {

  abstract getConnections(): BioxConnection[];

  abstract getNodes(): Record<string, BioxNode>;

  public getNodesArray(): BioxNode[] {
    const nodes: Record<string, BioxNode> = this.getNodes();
    return Object.keys(nodes).map(key => nodes[key]);
  }


  public initConnectionsAndNodes(): void {
    this.initNodeNames();
    this.initConnectionNodes();
    this.initNodesInputsOutputs();
  }

  /**
   * Set the node objects in the BioxConnectionPart to directly have access to T object in part
   */
  private initConnectionNodes(): void {
    const nodes: Record<string, BioxNode> = this.getNodes();
    for (const connection of this.getConnections()) {
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
    for (const connection of this.getConnections()) {
      const from: BioxNode = connection.from.getNode();
      from.addOutput(connection.to);

      const to: BioxNode = connection.to.getNode();
      to.setInput(connection.from);
    }
  }

  // init the name of the nodes
  private initNodeNames(): void {
    const nodes: Record<string, BioxNode> = this.getNodes();
    for (const name of Object.keys(nodes)) {
      nodes[name].name = name;
    }
  }

  // return the nodes that do not have any inputs
  public getRootNodes(): BioxNode[] {
    const roots: BioxNode[] = [];

    for (const node of this.getNodesArray()) {
      if (node.getInputsCount() === 0) {
        roots.push(node);
      }
    }

    return roots;
  }
}
