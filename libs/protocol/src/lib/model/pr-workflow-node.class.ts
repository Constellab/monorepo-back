import {PrWorkflowPort} from './pr-workflow-port.class';
import {DrawflowConnectionDetail, DrawflowNode} from 'drawflow';
import {BehaviorSubject, Observable} from 'rxjs';
import {FlCoord} from '@monorepo/front-core-lib';

/**
 * Single node in the workflow
 */
export abstract class PrWorkflowNode<T>{

  public nodeId: string;

  public inputPorts: PrWorkflowPort[];
  public outputPorts: PrWorkflowPort[];

  private getDrawflowNodeMethod: (id: string) => DrawflowNode;

  private object$: BehaviorSubject<T>;


  protected constructor(
    // unique node name in the layer
    public readonly nodeName: string,
    public readonly title: string,
    object: T,
    public x: number = 0,
    public y: number = 0) {
    this.object$ = new BehaviorSubject<T>(object);
    this.initPorts(object);
  }

  public initNode(nodeId: string, getDrawflowNodeMethod: (id: string) => DrawflowNode): void {
    this.nodeId = nodeId;
    this.getDrawflowNodeMethod = getDrawflowNodeMethod;
    this.initPortColors();
  }

  protected abstract initPorts(object: T): void;

  public abstract getHTML(): string;

  public abstract getClassName(): string;

  /////////////////////////////// OBJECT //////////////////////////////

  public get currentObject(): T {
    return this.object$.value;
  }

  public getObject$(): Observable<T> {
    return this.object$.asObservable();
  }

  public updateObject(object: T): void {
    this.object$.next(object);
  }

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

  public findInputPortByName(name: string): PrWorkflowPort {
    return this.inputPorts.find(p => p.name === name);
  }

  public findInputPortByDrawflowName(drawflowName: string): PrWorkflowPort {
    return this.inputPorts.find(p => p.drawFlowName === drawflowName);
  }

  /**
   * For each input port,
   * If it is not available --> disable it
   * If is not compatible with arg port --> disable it
   */
  public disableIncompatibleInputPort(outputPort: PrWorkflowPort): void {
    for (const port of this.inputPorts) {
      if (this.countInputConnections(port.drawFlowName) > 0 ||
        !port.isCompatible(outputPort)) {
        this.disabledPort(port);
      }
    }
  }

  /////////////////////////////// OUTPUT //////////////////////////////

  public countOutputs(): number {
    return this.outputPorts.length;
  }

  public findOutputPortByName(name: string): PrWorkflowPort {
    return this.outputPorts.find(p => p.name === name);
  }

  public findOutputPortByDrawflowName(drawflowName: string): PrWorkflowPort {
    return this.outputPorts.find(p => p.drawFlowName === drawflowName);
  }

  public disableOutputPorts(): void {
    for (const port of this.outputPorts) {
      this.disabledPort(port);
    }
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
    for (const port of [...this.inputPorts, ...this.outputPorts]) {
      // find port element as child of the node
      const portElement: HTMLElement = this.getPortElement(port.drawFlowName);

      if (portElement) {
        this.setPortElementColor(portElement, port.getDefaultColor());
      }
    }
  }

  protected getPortElement(drawflowPortName: string): HTMLElement | null {
    // retrieve the node HTML element
    const element: HTMLElement = this.getHTMLElement();
    if (element == null) return null;

    const portElement: Element = element.getElementsByClassName(drawflowPortName)[0];

    if (portElement == null || !(portElement instanceof HTMLElement)) return null;
    return portElement;
  }

  protected setPortElementColor(portElement: HTMLElement, color: string): void {
    portElement.style.backgroundColor = color;
  }

  /**
   * Mark the port as disable by setting its color to grey
   * @param port
   */
  public disabledPort(port: PrWorkflowPort): void {
    // retrieve the node HTML element
    const element: HTMLElement = this.getHTMLElement();

    const portElement: Element = element.getElementsByClassName(port.drawFlowName)[0];

    if (portElement && portElement instanceof HTMLElement) {
      // set the color
      portElement.style.backgroundColor = 'grey';
    }
  }

  public getCoords(): FlCoord {
    return {
      x: this.x,
      y: this.y
    };
  }

  private getNodeCoord(): FlCoord {
    const drawflowNode: DrawflowNode = this.getDrawflowNode();
    return {
      x: drawflowNode.pos_x,
      y: drawflowNode.pos_y
    };
  }

  public refreshCoords(): void {
    const coord: FlCoord = this.getNodeCoord();
    this.x = coord.x;
    this.y = coord.y;
  }

  public destroy(): void {
    this.object$.complete();
  }

}
