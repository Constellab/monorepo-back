import {DrawflowConnectionDetail, DrawflowNode} from 'drawflow';
import {WorkflowPort} from './workflow-port.class';

/**
 * Single node in the workflow
 */
export abstract class WorkflowNode<T> {

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
    public readonly initialCoordX: number = 0,
    public readonly initialCoordY: number = 0) {
    this.initPorts();
  }

  public initNode(nodeId: string, getDrawflowNodeMethod: (id: string) => DrawflowNode): void {
    this.nodeId = nodeId;
    this.getDrawflowNodeMethod = getDrawflowNodeMethod;
    this.initPortColors();
  }

  protected abstract initPorts(): void;

  public abstract getHTML(): string;

  public abstract getClassName(): string;


  /////////////////////////////// INPUT //////////////////////////////

  /**
   * Return the number of connection linked to a specific input
   *
   * @param portDrawflowName drawflow name of the port
   */
  public countInputConnections(portDrawflowName: string): number {
    const connection: DrawflowConnectionDetail[] = this.getDrawflowNode().inputs[portDrawflowName]?.connections || null;

    // if the input doesn't exist, consider it is not available
    if (connection == null) {
      return 2;
    }

    // if the connection is empty, the input is available
    return connection.length;
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

  /**
   * For each input port,
   * If it is not available --> disable it
   * If is not compatible with arg port --> disable it
   */
  public disableIncompatibleInputPort(outputPort: WorkflowPort): void {
    for (const port of this.inputPorts) {
      if (this.countInputConnections(port.drawFlowName) > 0 ||
        !port.isCompatible(outputPort)) {
        this.disabledPort(port);
      }
    }
  }

  public hasInputs(): boolean{
    return this.countInputs() > 0;
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

  public disableOutputPorts(): void {
    for (const port of this.outputPorts) {
      this.disabledPort(port);
    }
  }

  public hasOutputs(): boolean{
    return this.countOutputs() > 0;
  }

  /////////////////////////////// OTHER //////////////////////////////

  private getDrawflowNode(): DrawflowNode {
    return this.getDrawflowNodeMethod(this.nodeId);
  }

  private getHTMLId(): string {
    return 'node-' + this.nodeId;
  }

  private getHTMLElement(): HTMLElement {
    return document.getElementById(this.getHTMLId());
  }

  /**
   * set the port color based on port type
   */
  public initPortColors(): void {
    // retrieve the node HTML element
    const element: HTMLElement = this.getHTMLElement();

    for (const port of [...this.inputPorts, ...this.outputPorts]) {
      // find port element as child of the node
      const portElement: Element = element.getElementsByClassName(port.drawFlowName)[0];

      if (portElement && portElement instanceof HTMLElement) {
        // set the color
        portElement.style.backgroundColor = port.getColor();
      }
    }
  }

  /**
   * Mark the port as disable by setting its color to grey
   * @param port
   */
  public disabledPort(port: WorkflowPort): void {
    // retrieve the node HTML element
    const element: HTMLElement = this.getHTMLElement();

    const portElement: Element = element.getElementsByClassName(port.drawFlowName)[0];

    if (portElement && portElement instanceof HTMLElement) {
      // set the color
      portElement.style.backgroundColor = 'grey';
    }
  }

  public destroy(): void{

  }


}
