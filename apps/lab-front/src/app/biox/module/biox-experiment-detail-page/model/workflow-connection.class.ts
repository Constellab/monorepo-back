import {WorkflowNode} from './workflow-node.class';

export class WorkflowConnection<T> {

  constructor(public readonly outputNode: WorkflowNode<unknown>,
              public readonly inputNode: WorkflowNode<unknown>,
              public readonly outputName: string,
              public readonly inputName: string,
              public readonly object: T) {
  }

}
