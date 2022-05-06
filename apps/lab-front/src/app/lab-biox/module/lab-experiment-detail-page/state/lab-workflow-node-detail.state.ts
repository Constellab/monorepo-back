import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {switchMap} from 'rxjs/operators';
import {LabConfigValues} from '../../../../lab-core/model/entities/lab-config.entity';
import {LabWorkflowNodeProcess} from '../model/lab-workflow-node-process.class';
import {LabWorkflowManagerState} from './lab-workflow-manager-state';

/**
 * State to manage the selected node to show it in the drawer
 */
@Injectable()
export class LabWorkflowNodeDetailState {

  private node$: BehaviorSubject<LabWorkflowNodeProcess>;

  constructor(private workflowManagerState: LabWorkflowManagerState) {
  }

  public init(): void {
    this.node$ = new BehaviorSubject(null);
  }

  public setNode(node: LabWorkflowNodeProcess): void {
    this.node$.next(node);
  }

  public getNode$(): Observable<LabWorkflowNodeProcess> {
    return this.node$.asObservable();
  }

  public getProcess$(): Observable<LabProcess> {
    return this.getNode$().pipe(switchMap(node => node.getObject$()));
  }

  public clear(): void {
    this.node$.complete();
  }

  public updateConfigValues(config: LabConfigValues): void {
    this.workflowManagerState.updateProcessConfig(this.node$.value, config);
  }
}
