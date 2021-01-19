import {Injectable} from '@angular/core';
import {Workflow} from '../model/workflow.class';
import {BioxProcessable} from '../../../../core/model/global/biox-processable.class';
import {WorkflowNodeProcessable} from '../model/workflow-node-processable.class';
import {WorkflowNode} from '../model/workflow-node.class';

@Injectable()
export class WorkflowManagerService {

  private workflow: Workflow<BioxProcessable>;

  constructor() {
    console.log('New workflow manager');
  }

  public init(element: HTMLElement, data?: any): void {
    this.workflow = new Workflow(element);

    if (data) {
      this.workflow.setData(data);
    }

    this.workflow.start();
  }

  public addNode(bioxProcessable: BioxProcessable, posX: number = 0, posY: number = 0): void {
    const node: WorkflowNodeProcessable = new WorkflowNodeProcessable(bioxProcessable, posX, posY);
    this.workflow.addNode(node);
  }

  public findNodeWithHTMLId(htmlId: string): WorkflowNode<BioxProcessable> {
    return this.workflow.findNodeWithHTMLId(htmlId);
  }

  public switchModule(): void {
    this.workflow.switchModule();
  }
}
