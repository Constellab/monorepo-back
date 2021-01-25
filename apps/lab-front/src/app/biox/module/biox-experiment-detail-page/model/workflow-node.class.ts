import {DrawflowConnectionDetail, DrawflowNode} from 'drawflow';
import {LabEntity} from '../../../../core/model/global/lab-entity.entity';

/**
 * Single node in the workflow
 */
export class WorkflowNode<T extends LabEntity> {

  public html: string;

  public nodeId: string;

  // method to access the drawflow node
  private getDrawflowNodeMethod: (id: string) => DrawflowNode;

  private readonly INPUT_NAME_PREFIX: string = 'input_';
  private readonly OUTPUT_NAME_PREFIX: string = 'output_';

  constructor(public readonly nodeName: string,
              public readonly title: string,
              public readonly nbInputs: number,
              public readonly nbOutputs: number,
              public readonly object: T,
              public readonly initialPosX: number = 0,
              public readonly initialPosY: number = 0) {
  }

  public initNode(nodeId: string, getDrawflowNodeMethod: (id: string) => DrawflowNode): void {
    this.nodeId = nodeId;
    this.getDrawflowNodeMethod = getDrawflowNodeMethod;
  }


  /**
   * Check if the input exist and if it has not multiple connection
   *
   * @param inputName
   */
  public inputIsValid(inputName: string): boolean {
    const connection: DrawflowConnectionDetail[] = this.getDrawflowNode().inputs[inputName]?.connections || null;

    // if the input doesn't exist
    if (connection == null) {
      return false;
    }

    // if the connection is empty, the input is available
    return connection.length <= 1;
  }

  public getInputName(id: string | number): string {
    return this.INPUT_NAME_PREFIX + id.toString();
  }


  public getOutputName(id: string | number): string {
    return this.OUTPUT_NAME_PREFIX + id.toString();
  }

  private getDrawflowNode(): DrawflowNode {
    return this.getDrawflowNodeMethod(this.nodeId);
  }


}
