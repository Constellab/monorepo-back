import {DrawflowConnectionDetail, DrawflowNode} from 'drawflow';
import {WorkflowPort} from './workflow-port.class';

/**
 * Single node in the workflow
 */
export abstract class WorkflowNode<T> {

  public html: string;

  public nodeId: string;

  public inputPorts: WorkflowPort[];
  public outputPorts: WorkflowPort[];

  // method to access the drawflow node
  private getDrawflowNodeMethod: (id: string) => DrawflowNode;

  protected constructor(
    // unique node name in the layer
    public readonly nodeName: string,
    public readonly title: string,
    public readonly object: T,
    public readonly className: string,
    public readonly initialCoordX: number = 0,
    public readonly initialCoordY: number = 0) {
    this.initPorts();
  }

  public initNode(nodeId: string, getDrawflowNodeMethod: (id: string) => DrawflowNode): void {
    this.nodeId = nodeId;
    this.getDrawflowNodeMethod = getDrawflowNodeMethod;
    this.setPortColors();
  }

  protected abstract initPorts(): void;


  /////////////////////////////// INPUT //////////////////////////////

  /**
   * Check if the input exist and if it has not multiple connection
   *
   * @param inputName
   */
  public inputIsAvailable(inputName: string): boolean {
    const connection: DrawflowConnectionDetail[] = this.getDrawflowNode().inputs[inputName]?.connections || null;

    // if the input doesn't exist
    if (connection == null) {
      return false;
    }

    // if the connection is empty, the input is available
    return connection.length <= 1;
  }


  public countInputs(): number {
    return this.inputPorts.length;
  }

  public findInputPortByName(name: string): WorkflowPort {
    return this.inputPorts.find(p => p.name === name);
  }

  public findInputPortByDrawflowName(drawflowName: string): WorkflowPort {
    return this.inputPorts.find(p => p.drawFlowName === drawflowName);
  }

  /////////////////////////////// OUTPUT //////////////////////////////

  public countOutputs(): number {
    return this.outputPorts.length;
  }

  public findOutputPortByName(name: string): WorkflowPort {
    return this.outputPorts.find(p => p.name === name);
  }

  public findOutputPortByDrawflowName(drawflowName: string): WorkflowPort {
    return this.outputPorts.find(p => p.drawFlowName === drawflowName);
  }

  /////////////////////////////// OTHER //////////////////////////////

  private getDrawflowNode(): DrawflowNode {
    return this.getDrawflowNodeMethod(this.nodeId);
  }

  private getHTMLId(): string {
    return 'node-' + this.nodeId;
  }

  /**
   * set the port color based on port type
   */
  public setPortColors(): void {
    // retrieve the node HTML element
    const element: HTMLElement = document.getElementById(this.getHTMLId());

    for (const port of [...this.inputPorts, ...this.outputPorts]) {
      // find port element as child of the node
      const portElement: Element = element.getElementsByClassName(port.drawFlowName)[0];

      if (portElement && portElement instanceof HTMLElement) {
        // set the color
        portElement.style.backgroundColor = port.getColor();
      }
    }
  }

}
