import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WorkflowNode} from '../model/workflow-node.class';
import {BioxProcessable} from '../../../../core/model/entities/proccesable/biox-processable.entity';
import {map} from 'rxjs/operators';


@Injectable()
export class BioxWorkflowNodeDetailState {

  private node$: BehaviorSubject<WorkflowNode<BioxProcessable>>;

  constructor() {
  }

  public init(): void {
    this.node$ = new BehaviorSubject<WorkflowNode<BioxProcessable>>(null);
  }


  public setNode(node: WorkflowNode<BioxProcessable>): void {
    this.node$.next(node);
  }

  public getNode$(): Observable<WorkflowNode<BioxProcessable>> {
    return this.node$.asObservable();
  }

  public getProcess$(): Observable<BioxProcessable> {
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
