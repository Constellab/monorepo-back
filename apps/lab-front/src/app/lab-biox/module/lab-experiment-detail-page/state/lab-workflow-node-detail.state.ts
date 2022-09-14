import {Injectable} from '@angular/core';
import {BehaviorSubject, filter, firstValueFrom, Observable, Subscription, switchMap} from 'rxjs';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {LabExperimentDetailPageState} from './lab-experiment-detail-page.state';
import {
  PrConfigValues,
  PrWorkflowActionSelectNode,
  PrWorkflowActionState,
  PrWorkflowNodeProcess
} from '@monorepo/protocol';
import {MatDrawer} from '@angular/material/sidenav';

/**
 * State to manage the selected node to show it in the drawer
 */
@Injectable()
export class LabWorkflowNodeDetailState {

  private node$: BehaviorSubject<PrWorkflowNodeProcess>;

  private drawer: MatDrawer;
  private subscription: Subscription;

  constructor(private experimentState: LabExperimentDetailPageState,
              private actionState: PrWorkflowActionState) {
  }

  public init(drawer: MatDrawer): void {
    this.node$ = new BehaviorSubject(null);
    this.drawer = drawer;

    this.subscription = this.actionState.getAction$().pipe(
      filter(action => action?.action === 'selectNode')
    ).subscribe(
      (action: PrWorkflowActionSelectNode) => {
        this.setNode(action.processNode);
        this.drawer.open();
      }
    );
  }

  public setNode(node: PrWorkflowNodeProcess): void {
    this.node$.next(node);
  }

  public getNode$(): Observable<PrWorkflowNodeProcess> {
    return this.node$.asObservable();
  }

  public getProcess$(): Observable<LabProcess> {
    return this.getNode$().pipe(
      filter(node => node != null),
      switchMap(node => node.getObject$() as Observable<LabProcess>));
  }

  public getProcessPromise(): Promise<LabProcess> {
    return firstValueFrom(this.getProcess$());
  }

  public clear(): void {
    this.node$.complete();
    this.subscription?.unsubscribe();
  }

  // TODO to improve
  public updateConfigValues(config: PrConfigValues): void {
    const node = this.node$.value;
    this.experimentState.updateProcessConfig(node.parentLayerId, node.nodeName, config);
  }
}
