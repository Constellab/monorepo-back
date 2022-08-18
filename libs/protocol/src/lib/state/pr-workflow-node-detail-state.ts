import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {PrWorkflowNodeProcess} from '../model/pr-workflow-node-process.class';
import {PrWorkflowManagerState} from './pr-workflow-manager-state';
import {PrProcess} from '../model/pr-process.entity';

/**
 * State to manage the selected node to show it in the drawer
 */
@Injectable()
export class PrWorkflowNodeDetailState {

  private node$: BehaviorSubject<PrWorkflowNodeProcess>;

  constructor(private workflowManagerState: PrWorkflowManagerState) {
  }

  public init(): void {
    this.node$ = new BehaviorSubject(null);
  }

  public setNode(node: PrWorkflowNodeProcess): void {
    this.node$.next(node);
  }

  public getNode$(): Observable<PrWorkflowNodeProcess> {
    return this.node$.asObservable();
  }

  public getProcess$(): Observable<PrProcess> {
    return this.getNode$().pipe(switchMap(node => node.getObject$()));
  }

  public clear(): void {
    this.node$.complete();
  }
}
