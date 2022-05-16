import {Injectable} from '@angular/core';
import {LabExperimentService} from '../../../../lab-core/entity-service/lab-experiment.service';
import {BehaviorSubject, merge, Observable, of, Subject, Subscription} from 'rxjs';
import {LabExperiment} from '../../../../lab-core/model/entities/lab-experiment.entity';
import {filter, map, tap} from 'rxjs/operators';
import {LabFlow} from '../../../../lab-core/model/global/lab-connection.class';
import {LabProtocol} from '../../../../lab-core/model/entities/process/lab-protocol.entity';
import {LabProtocolService} from '../../../../lab-core/entity-service/lab-protocol.service';
import {LabTag} from '../../../../lab-core/model/entities/lab-tag.entity';
import {FlPortalActionsService, FlQuillJson} from '@monorepo/front-core-lib';
import {LabConfigValues} from '../../../../lab-core/model/entities/lab-config.entity';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';

@Injectable()
export class LabExperimentDetailPageState {

  private experiment$: BehaviorSubject<LabExperiment>;
  private experimentDescription$: BehaviorSubject<FlQuillJson>;

  // observable where flow are emitted when there are retrieved form DB
  private flowChange$: Subject<LabFlow<LabProtocol>>;

  // save the list flows where the key is the protocol id
  private flows: Record<string, LabFlow<LabProtocol>>;

  // does not emit experiment until ready is true
  private ready: boolean = false;

  // refresh time : 15sec
  private refreshIntervalDuration: number = 15000;
  private timeout: any;
  private refreshSubscription: Subscription;

  private mainProtocolId: string;

  constructor(private experimentService: LabExperimentService,
              private protocolService: LabProtocolService,
              private actionsService: FlPortalActionsService) {
  }

  public init(experimentId: string): void {
    this.ready = false;
    this.experiment$ = new BehaviorSubject(null);
    this.experimentDescription$ = new BehaviorSubject(null);
    this.flowChange$ = new Subject();
    this.flows = {};
    this.experimentService.getExperiment(experimentId).subscribe(
      {
        next: experiment => this.getExperimentSuccess(experiment),
        error: error => this.experiment$.error(error)
      }
    );
  }

  private getExperimentSuccess(experiment: LabExperiment): void {
    this.ready = true;
    this.experiment$.next(experiment);
    this.experimentDescription$.next(experiment.description);

    // save the main protocol id to differentiate it from the others
    this.mainProtocolId = experiment.protocol.id;
  }

  public getExperiment$(): Observable<LabExperiment> {
    return this.experiment$.asObservable().pipe(
      filter(() => this.ready)
    );
  }

  public get currentExperiment(): LabExperiment {
    return this.experiment$.value;
  }

  public isEditable$(): Observable<boolean> {
    return this.getExperiment$().pipe(map(experiment => experiment.isEditable()));
  }

  /**
   * Update the experiment locally
   * @param experiment
   * @param refreshWorkflow if true, the flow are reloaded
   */
  public updateExperiment(experiment: LabExperiment, refreshWorkflow: boolean = false): void {
    if (experiment == null) return;
    this.experiment$.next(experiment);

    if (refreshWorkflow) {
      this.refreshAllFlows();
    }
  }

  public updateTags(tags: LabTag[]): void {
    this.experiment$.value.tags = tags;
  }

  public getDescription$(): Observable<FlQuillJson> {
    return this.experimentDescription$.asObservable();
  }

  public updateDescription(description: FlQuillJson): void {
    this.experimentDescription$.next(description);
  }

  private refreshExperiment(): void {
    this.experimentService.getExperiment(this.currentExperiment.id).subscribe(
      experiment => this.updateExperiment(experiment)
    );
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

  private refreshFlows(flowIds: string[]): Observable<LabFlow<LabProtocol>> {
    const obs: Observable<LabFlow<LabProtocol>>[] = flowIds.map(id => this.protocolService.getProtocolAsFlow(id));
    return merge(...obs).pipe(
      tap(flow => this.refreshFlowSuccess(flow)),
    );

  }

  public stopFlowsRefresh(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.refreshSubscription?.unsubscribe();
  }

  /////////////////////////////////// FLOW ////////////////////////////////////

  /**
   * Get a flow from cache is possible, otherwise load it
   * @param protocolId
   */
  public getFlow(protocolId: string): Observable<LabFlow<LabProtocol>> {
    if (this.flows[protocolId]) return of(this.flows[protocolId]);

    return this.protocolService.getProtocolAsFlow(protocolId).pipe(tap({
      next: flow => this.cacheFlow(flow),
    }));
  }

  private refreshFlowSuccess(flow: LabFlow<LabProtocol>): void {
    this.cacheFlow(flow);
    // if the main flow is finished, refresh the experiment
    if (flow.object.isFinished()) {
      this.refreshExperiment();
    }
    this.flowChange$.next(flow);
  }


  private cacheFlow(flow: LabFlow<LabProtocol>): void {
    // save the sub flow
    this.flows[flow.object.id] = flow;
  }


  public getMainFlow$(): Observable<LabFlow<LabProtocol>> {
    return this.getFlow(this.mainProtocolId);
  }

  private getCurrentMainFlow(): LabFlow<LabProtocol> {
    return this.flows[this.mainProtocolId];
  }

  /**
   * Notify each time of flow is retrieved
   */
  public getFlowUpdate$(): Observable<LabFlow<LabProtocol>> {
    return this.flowChange$.asObservable();
  }


  ////////////////////// OTHER ///////////////////////
  public updateProcessConfig(protocolId: string, processInstanceName: string, config: LabConfigValues): void {
    const node = this.findNodeWithName(protocolId, processInstanceName);

    if (node == null) return;

    const flow = this.flows[protocolId];

    node.updateConfig(config);
    // refresh the complete flow to trigger object update
    this.refreshFlowSuccess(flow);

    const obs = this.protocolService.saveProcessConfig(protocolId, processInstanceName, config);
    this.actionsService.addAction({
      type: 'workflow-save-config',
      action: obs,
      text: {text: 'biox.saving_config', translateText: true}
    });
  }

  private findNodeWithName(protocolId: string, processInstanceName: string): LabProcess {
    const flow = this.flows[protocolId];
    if (!flow) return null;

    return flow.object.getProcess(processInstanceName);
  }

  public clear(): void {
    this.experiment$.complete();
    this.flowChange$.complete();
    this.experimentDescription$.complete();
    this.stopFlowsRefresh();
  }
}
