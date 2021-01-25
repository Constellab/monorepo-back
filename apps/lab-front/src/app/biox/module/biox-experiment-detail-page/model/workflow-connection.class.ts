import {WorkflowNode} from './workflow-node.class';

export class WorkflowConnection<T> {

  constructor(public readonly outputNode: WorkflowNode<any>,
              public readonly inputNode: WorkflowNode<any>,
              public readonly outputName: string,
              public readonly inputName: string,
              public readonly object: T) {
  }

}
