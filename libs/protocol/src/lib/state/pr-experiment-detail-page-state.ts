import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {FlPortalActionsService, FlQuillJson} from '@monorepo/front-core-lib';
import {PrExperiment} from '../model/pr-experiment.entity';
import {PrFlow} from '../model/pr-connection.class';
import {PrProtocol} from '../model/pr-protocol.entity';
import {PrTag} from '../model/pr-tag.entity';
import {PrConfigValues} from '../model/pr-config.entity';
import {PrProcess} from '../model/pr-process.entity';


@Injectable()
export class PrExperimentDetailPageState {

  private experiment$: BehaviorSubject<PrExperiment>;
  private experimentDescription$: BehaviorSubject<FlQuillJson>;

  // observable where flow are emitted when there are retrieved form DB
  private flowChange$: Subject<PrFlow<PrProtocol>> = new Subject<PrFlow<PrProtocol>>();

  // save the list flows where the key is the protocol id
  private flows: Record<string, PrFlow<PrProtocol>>;

  // does not emit experiment until ready is true
  private ready: boolean = false;

  // refresh time : 15sec
  private refreshIntervalDuration: number = 15000;
  private timeout: any;
  private refreshSubscription: Subscription;

  private mainProtocolId: string;

  constructor(private actionsService: FlPortalActionsService) {
  }

  public get currentExperiment(): PrExperiment {
    return this.experiment$.value;
  }

  public init(experimentId: string): void {
    this.ready = false;
    this.experiment$ = new BehaviorSubject(null);
    this.experimentDescription$ = new BehaviorSubject(null);
    this.flowChange$ = new Subject();
    this.flows = {};
  }

  public getExperiment$(): Observable<PrExperiment> {
    return this.experiment$.asObservable().pipe(
      filter(() => this.ready),
    );
  }

  public isEditable$(): Observable<boolean> {
    return this.getExperiment$().pipe(map(experiment => experiment.isEditable()));
  }

  /**
   * Update the experiment locally
   * @param experiment
   * @param refreshWorkflow if true, the flow are reloaded
   */
  public updateExperiment(experiment: PrExperiment, refreshWorkflow: boolean = false): void {
    if (experiment == null) return;
    this.experiment$.next(experiment);

    if (refreshWorkflow) {
      this.refreshAllFlows();
    }
  }

  public updateTags(tags: PrTag[]): void {
    this.experiment$.value.tags = tags;
  }

  public getDescription$(): Observable<FlQuillJson> {
    return this.experimentDescription$.asObservable();
  }

  public updateDescription(description: FlQuillJson): void {
    this.experimentDescription$.next(description);
  }

  /**
   * Check if the experiment is waiting or running and start to refresh the flow if yes
   */
  public checkAndStartRefreshFlow(): void {
    this.timeout = setTimeout(() => {

      const mainFlow = this.getCurrentMainFlow();
      const experiment = this.currentExperiment;
      // Stop refresh if experiment is not running (including queue) and the main flow is finished
      if ((!experiment.isRunning() && experiment.status.value !== 'IN_QUEUE') || mainFlow.object.isFinished()) return;

      // retrieve all not finished protocols
      const notFinishedFlowIds: string[] = Object.values(this.flows)
        .filter(flow => !flow.object.isFinished()).map(flow => flow.object.id);
      this.refreshFlowsTick(notFinishedFlowIds);
    }, this.refreshIntervalDuration);
  }

  /**
   * Start to refresh the flow
   */
  public startFlowsRefresh(): void {
    // retrieve all not finished protocols
    const allFlows: string[] = [
      ...Object.values(this.flows).map(flow => flow.object.id)
    ];
    this.refreshFlowsTick(allFlows);
  }

  public stopFlowsRefresh(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.refreshSubscription?.unsubscribe();
  }

  /**
   * Notify each time of flow is retrieved
   */
  public getFlowUpdate$(): Observable<PrFlow<PrProtocol>> {
    return this.flowChange$.asObservable();
  }

  ////////////////////// OTHER ///////////////////////
  public updateProcessConfig(protocolId: string, processInstanceName: string, config: PrConfigValues): void {
    const node = this.findNodeWithName(protocolId, processInstanceName);

    if (node == null) {
      console.error(`Could not find node with name ${processInstanceName} in protocol ${protocolId}`);
      return;
    }

    const flow = this.flows[protocolId];

    node.updateConfig(config);
    // refresh the complete flow to trigger object update
    this.refreshFlowSuccess(flow);
  }

  public clear(): void {
    this.experiment$.complete();
    this.flowChange$.complete();
    this.experimentDescription$.complete();
    this.stopFlowsRefresh();
  }

  /////////////////////////////////// FLOW ////////////////////////////////////

  private getExperimentSuccess(experiment: PrExperiment): void {
    this.ready = true;
    this.experiment$.next(experiment);
    this.experimentDescription$.next(experiment.description);

    // save the main protocol id to differentiate it from the others
    this.mainProtocolId = experiment.protocol.id;
  }

  /**
   * One tick to refresh the flow, after getting all flow, it calls get flow again
   * @param flowIds
   * @private
   */
  private refreshFlowsTick(flowIds: string[]): void {
    this.refreshSubscription = this.refreshFlows(flowIds).subscribe(
      {
        complete: () => this.checkAndStartRefreshFlow()
      }
    );
  }

  private refreshAllFlows(): void {
    this.refreshFlows(Object.keys(this.flows)).subscribe();
  }

  private refreshFlows(flowIds: string[]): Observable<PrFlow<PrProtocol>> {
    return null;
  }

  private refreshFlowSuccess(flow: PrFlow<PrProtocol>): void {
    this.cacheFlow(flow);
    this.flowChange$.next(flow);
  }

  private cacheFlow(flow: PrFlow<PrProtocol>): void {
    // save the sub flow
    this.flows[flow.object.id] = flow;
  }

  private getCurrentMainFlow(): PrFlow<PrProtocol> {
    return this.flows[this.mainProtocolId];
  }

  private findNodeWithName(protocolId: string, processInstanceName: string): PrProcess {
    const flow = this.flows[protocolId];
    if (!flow) return null;

    return flow.object.getProcess(processInstanceName);
  }
}
