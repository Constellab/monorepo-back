import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {PrWorkflowNodeProcess} from '../model/pr-workflow-node-process.class';

/**
 * State to manage the selected node to show it in the drawer
 */
@Injectable()
export class PrWorkflowNodeDetailState {

  private node$: BehaviorSubject<PrWorkflowNodeProcess>;

  constructor() {
  }

  public init(): void {
    this.node$ = new BehaviorSubject(null);
  }

  public setNode(node: PrWorkflowNodeProcess): void {
    this.node$.next(node);
  }

  public clear(): void {
    this.node$.complete();
  }
}
