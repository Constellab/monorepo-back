import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {LabWorkflowNode} from '../model/lab-workflow-node.class';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {map} from 'rxjs/operators';
import {LabConfigValues} from '../../../../lab-core/model/entities/lab-config.entity';

/**
 * State to manage the selected node to show it in the drawer
 */
@Injectable()
export class LabWorkflowNodeDetailState {

  private node$: BehaviorSubject<LabWorkflowNode<LabProcess>>;

  constructor() {
  }

  public init(): void {
    this.node$ = new BehaviorSubject<LabWorkflowNode<LabProcess>>(null);
  }


  public setNode(node: LabWorkflowNode<LabProcess>): void {
    this.node$.next(node);
  }

  public getNode$(): Observable<LabWorkflowNode<LabProcess>> {
    return this.node$.asObservable();
  }

  public getProcess$(): Observable<LabProcess> {
    return this.getNode$().pipe(map(n => n.object));
  }

  public clear(): void {
    this.node$.complete();
  }

  public updateConfigValues(config: LabConfigValues): void{
    this.node$.value.object.config.data.values = config;
    this.emitCurrentNode();
  }

  private emitCurrentNode(): void{
    this.node$.next(this.node$.value);
  }

}
