import {DrawflowConnectionDetail, DrawflowNode} from 'drawflow';

/**
 * Single node in the workflow
 */
export abstract class WorkflowNode<T> {

  public html: string;

  public nodeId: string;

  // method to access the drawflow node
  private getDrawflowNodeMethod: (id: string) => DrawflowNode;

  private readonly INPUT_NAME_PREFIX: string = 'input_';
  private readonly OUTPUT_NAME_PREFIX: string = 'output_';

  protected constructor(
    // unique node name in the layer
    public readonly nodeName: string,
    public readonly title: string,
    public readonly nbInputs: number,
    public readonly nbOutputs: number,
    public readonly object: T,
    public readonly className: string,
    public readonly initialCoordX: number = 0,
    public readonly initialCoordY: number = 0) {
  }

  public initNode(nodeId: string, getDrawflowNodeMethod: (id: string) => DrawflowNode): void {
    this.nodeId = nodeId;
    this.getDrawflowNodeMethod = getDrawflowNodeMethod;
  }


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


  // find the input name that match the portName
  public abstract findInputName(portName: string): string ;

  protected getInputName(id: string | number): string {
    return this.INPUT_NAME_PREFIX + id.toString();
  }

  /////////////////////////////// OUTPUT //////////////////////////////

  // find the output name that match the portName
  public abstract findOutputName(portName: string): string ;

  protected getOutputName(id: string | number): string {
    return this.OUTPUT_NAME_PREFIX + id.toString();
  }

  /////////////////////////////// OTHER //////////////////////////////

  protected findPortName(portName: string, specs: Record<string, any>, type: 'input' | 'output'): string {
    let i = 1;
    for (const property of Object.keys(specs)) {
      if (property === portName) {
        if (type === 'input') {
          return this.getInputName(i);
        } else {
          return this.getOutputName(i);
        }
      }
      i++;
    }

    console.error('Port not found');
    return null;
  }

  private getDrawflowNode(): DrawflowNode {
    return this.getDrawflowNodeMethod(this.nodeId);
  }


}
