/**
 * Single node in the worklow
 */
export class WorkflowNode<T> {

  private static id: number = 0;
  public readonly htmlId: string;

  public html: string;

  public nodeId: string;

  private readonly INPUT_NAME_PREFIX: string = 'input_';
  private readonly OUTPUT_NAME_PREFIX: string = 'output_';

  // use to check if an input is available
  private availableInputs: string[];

  constructor(public readonly name: string,
              public readonly nbInputs: number,
              public readonly nbOutputs: number,
              public readonly object: T,
              public readonly initialPosX: number = 0,
              public readonly initialPosY: number = 0) {
    this.htmlId = WorkflowNode.id.toString();
    WorkflowNode.id++;

    this.initAvailableInputs();
  }

  private initAvailableInputs(): void {
    const availableInputs: string[] = [];
    for (let i = 0; i < this.nbInputs; i++) {
      availableInputs.push(this.getInputName(i + 1));
    }

    this.availableInputs = availableInputs;
  }

  /**
   * Mark the input as unavailable
   * @param inputName
   */
  public markInputAsUnavailable(inputName: string): void {
    // remove the input from available inputs
    const index: number = this.findInputAvailableIndex(inputName);

    if (index !== -1) {
      this.availableInputs.splice(index);
    }
  }

  /**
   * Mark the input as available
   * @param inputName
   */
  public markInputAsAvailable(inputName: string): void {
    // add it only if it doesn't exists
    if (!this.inputIsAvailable(inputName)) {
      this.availableInputs.push(inputName);
    }
  }

  /**
   * Check if the input is available for connection
   * @param inputName
   */
  public inputIsAvailable(inputName: string): boolean {
    return this.findInputAvailableIndex(inputName) !== -1;
  }

  public findInputAvailableIndex(inputName: string): number {
    return this.availableInputs.findIndex(name => inputName === name);
  }


  /**
   * Mark the input as not used anymore
   * @param inputName
   */
  public clearInput(inputName: string): void {
    this.availableInputs.push(inputName);
  }

  public getInputName(id: string | number): string {
    return this.INPUT_NAME_PREFIX + id.toString();
  }


  public getOutputName(id: string | number): string {
    return this.OUTPUT_NAME_PREFIX + id.toString();
  }

}
