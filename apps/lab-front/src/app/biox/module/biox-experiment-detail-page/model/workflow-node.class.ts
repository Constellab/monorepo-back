export class WorkflowNode<T> {

  // Todo improve id management
  public htmlId: string = (new Date().getTime()).toString();
  public html: string;

  public nodeId: string;

  constructor(public readonly name: string,
              public readonly nbInputs: number,
              public readonly nbOutputs: number,
              public readonly object: T,
              public posX: number = 0,
              public posY: number = 0) {
  }
}
