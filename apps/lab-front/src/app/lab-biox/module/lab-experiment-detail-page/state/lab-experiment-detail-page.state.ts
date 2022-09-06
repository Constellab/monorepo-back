import {Injectable} from '@angular/core';
import {LabExperimentService} from '../../../../lab-core/entity-service/lab-experiment.service';
import {BehaviorSubject, merge, Observable, of, Subject, Subscription} from 'rxjs';
import {LabExperiment} from '../../../../lab-core/model/entities/lab-experiment.entity';
import {filter, map, tap} from 'rxjs/operators';
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

  // observable where protocol are emitted when there are retrieved form DB
  private protocolChange$: Subject<LabProtocol>;

  // save the list flows where the key is the protocol id
  private protocols: Record<string, LabProtocol>;

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
    this.protocolChange$ = new Subject();
    this.protocols = {};
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
      filter(() => this.ready),
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
   * @param refreshWorkflow if true, the protocol are reloaded
   */
  public updateExperiment(experiment: LabExperiment, refreshWorkflow: boolean = false): void {
    if (experiment == null) return;
    this.experiment$.next(experiment);

    if (refreshWorkflow) {
      this.refreshAllProtocols();
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
   * Check if the experiment is waiting or running and start to refresh the protocol if yes
   */
  public checkAndStartRefreshProtocol(): void {
    this.timeout = setTimeout(() => {

      const mainProtocol = this.getCurrentProtocol();
      const experiment = this.currentExperiment;
      // Stop refresh if experiment is not running (including queue) and the main protocol is finished
      if ((!experiment.isRunning() && experiment.status.value !== 'IN_QUEUE') || mainProtocol.isFinished()) return;

      // retrieve all not finished protocols
      const notFinishedProtocolIds: string[] = Object.values(this.protocols)
        .filter(protocol => !protocol.isFinished()).map(protocol => protocol.id);
      this.refreshProtocolsTick(notFinishedProtocolIds);
      this.refreshExperiment();
    }, this.refreshIntervalDuration);
  }

  /**
   * Start to refresh the protocol
   */
  public startProtocolsRefresh(): void {
    // retrieve all not finished protocols
    const allProtocols: string[] = [
      ...Object.values(this.protocols).map(protocol => protocol.id)
    ];
    this.refreshProtocolsTick(allProtocols);
  }

  /**
   * One tick to refresh the protocol, after getting all protocol, it calls get protocol again
   * @param flowIds
   * @private
   */
  private refreshProtocolsTick(flowIds: string[]): void {
    this.refreshSubscription = this.refreshProtocols(flowIds).subscribe(
      {
        complete: () => this.checkAndStartRefreshProtocol()
      }
    );
  }

  private refreshAllProtocols(): void {
    this.refreshProtocols(Object.keys(this.protocols)).subscribe();
  }

  private refreshProtocols(flowIds: string[]): Observable<LabProtocol> {
    const obs: Observable<LabProtocol>[] = flowIds.map(id => this.protocolService.getProtocol(id));
    return merge(...obs).pipe(
      tap(protocol => this.refreshProtocolSuccess(protocol)),
    );

  }

  public stopProtocolsRefresh(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.refreshSubscription?.unsubscribe();
  }

  /////////////////////////////////// FLOW ////////////////////////////////////

  /**
   * Get a protocol from cache is possible, otherwise load it
   * @param protocolId
   */
  public getProtocol(protocolId: string): Observable<LabProtocol> {
    if (this.protocols[protocolId]) return of(this.protocols[protocolId]);

    return this.protocolService.getProtocol(protocolId).pipe(tap({
      next: protocol => this.cacheProtocol(protocol),
    }));
  }

  private refreshProtocolSuccess(protocol: LabProtocol): void {
    this.cacheProtocol(protocol);
    this.protocolChange$.next(protocol);
  }


  private cacheProtocol(protocol: LabProtocol): void {
    // save the sub protocol
    this.protocols[protocol.id] = protocol;
  }


  public getMainProtocol$(): Observable<LabProtocol> {
    return this.getProtocol(this.mainProtocolId);
  }

  private getCurrentProtocol(): LabProtocol {
    return this.protocols[this.mainProtocolId];
  }

  /**
   * Notify each time of protocol is retrieved
   */
  public getProtocolUpdate$(): Observable<LabProtocol> {
    return this.protocolChange$.asObservable();
  }


  ////////////////////// OTHER ///////////////////////
  public updateProcessConfig(protocolId: string, processInstanceName: string, config: LabConfigValues): void {
    const node = this.findNodeWithName(protocolId, processInstanceName);

    if (node == null){
      console.error(`Could not find node with name ${processInstanceName} in protocol ${protocolId}`);
      return;
    }

    const protocol = this.protocols[protocolId];

    node.updateConfig(config);
    // refresh the complete protocol to trigger object update
    this.refreshProtocolSuccess(protocol);

    const obs = this.protocolService.saveProcessConfig(protocolId, processInstanceName, config);
    this.actionsService.addAction({
      type: 'workflow-save-config',
      action: obs,
      text: {text: 'biox.saving_config', translateText: true}
    });
  }

  private findNodeWithName(protocolId: string, processInstanceName: string): LabProcess {
    const protocol = this.protocols[protocolId];
    if (!protocol) return null;

    return protocol.getProcess(processInstanceName);
  }

  public clear(): void {
    this.experiment$.complete();
    this.protocolChange$.complete();
    this.experimentDescription$.complete();
    this.stopProtocolsRefresh();
  }
}
