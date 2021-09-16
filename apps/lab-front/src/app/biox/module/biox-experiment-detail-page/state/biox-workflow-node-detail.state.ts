import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WorkflowNode} from '../model/workflow-node.class';
import {BioxProcess} from '../../../../core/model/entities/process/biox-process.entity';
import {map} from 'rxjs/operators';


@Injectable()
export class BioxWorkflowNodeDetailState {

  private node$: BehaviorSubject<WorkflowNode<BioxProcess>>;

  constructor() {
  }

  public init(): void {
    this.node$ = new BehaviorSubject<WorkflowNode<BioxProcess>>(null);
  }


  public setNode(node: WorkflowNode<BioxProcess>): void {
    this.node$.next(node);
  }

  public getNode$(): Observable<WorkflowNode<BioxProcess>> {
    return this.node$.asObservable();
  }

  public getProcess$(): Observable<BioxProcess> {
    return this.getNode$().pipe(map(n => n.object));
  }

  public clear(): void {
    this.node$.complete();
  }

  public updateConfig(config: any): void{
    this.node$.value.object.config.data.values = config;
    this.emitCurrentNode();
  }

  private emitCurrentNode(): void{
    this.node$.next(this.node$.value);
  }

}
