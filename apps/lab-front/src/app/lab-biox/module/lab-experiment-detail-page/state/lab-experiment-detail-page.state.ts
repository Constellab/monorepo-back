import {Injectable} from '@angular/core';
import {LabExperimentService} from '../../../../lab-core/entity-service/lab-experiment.service';
import {BehaviorSubject, merge, Observable, of, Subscription} from 'rxjs';
import {LabExperiment} from '../../../../lab-core/model/entities/lab-experiment.entity';
import {filter, map, tap} from 'rxjs/operators';
import {LabProtocol} from '../../../../lab-core/model/entities/process/lab-protocol.entity';
import {LabProtocolService} from '../../../../lab-core/entity-service/lab-protocol.service';
import {LabTag} from '../../../../lab-core/model/entities/lab-tag.entity';
import {FlPortalActionsService, FlQuillJson} from '@monorepo/front-core-lib';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {
  PrConfigValues,
  PrWorkflow,
  PrWorkflowLayer,
  PrWorkflowNode,
  PrWorkflowNodeProcess,
  PrWorkflowNodeProtocol
} from '@monorepo/protocol';
import {LabWorkflowFactory} from '../model/lab-workflow.factory';

@Injectable()
export class LabExperimentDetailPageState {

  private experiment$: BehaviorSubject<LabExperiment>;
  private experimentDescription$: BehaviorSubject<FlQuillJson>;

  public workflow: PrWorkflow;
  private mainProtocol$: BehaviorSubject<LabProtocol>;

  // does not emit experiment until ready is true
  private ready: boolean = false;

  // refresh time : 15sec
  private refreshIntervalDuration: number = 15000;
  private timeout: any;
  private refreshSubscription: Subscription;
  private experimentSubscription: Subscription;


  constructor(private experimentService: LabExperimentService,
              private protocolService: LabProtocolService,
              private actionsService: FlPortalActionsService,
              private workflowFactory: LabWorkflowFactory) {
  }

  public init(experimentId: string): void {
    this.ready = false;
    this.experiment$ = new BehaviorSubject(null);
    this.experimentDescription$ = new BehaviorSubject(null);
    this.mainProtocol$ = new BehaviorSubject(null);
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

    this.protocolService.getProtocol(experiment.protocol.id).subscribe({
      next: protocol => this.onMainProtocolLoaded(protocol),
      error: error => this.mainProtocol$.error(error)
    });
  }

  private onMainProtocolLoaded(protocol: LabProtocol): void {
    this.workflow = this.workflowFactory.protocolToWorkflow(protocol);
    this.mainProtocol$.next(protocol);
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
    this.experimentSubscription = this.experimentService.getExperiment(this.currentExperiment.id).subscribe(
      experiment => this.updateExperiment(experiment)
    );
  }


  /**
   * Check if the experiment is waiting or running and start to refresh the protocol if yes
   */
  public checkAndStartRefreshProtocol(): void {
    this.timeout = setTimeout(() => {

      const mainProtocol = this.getCurrentMainProtocol();
      const experiment = this.currentExperiment;
      // Stop refresh if experiment is not running (including queue) and the main protocol is finished
      if ((!experiment.isRunning() && experiment.status.value !== 'IN_QUEUE') || mainProtocol.isFinished()) return;

      // retrieve all not finished protocols
      const notFinishedProtocolIds: string[] = this.getProtocols()
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
    const allProtocols: string[] = this.getProtocols().map(protocol => protocol.id);
    this.refreshProtocolsTick(allProtocols);
  }

  /**
   * One tick to refresh the protocol, after getting all protocol, it calls get protocol again
   * @param protocolIds
   * @private
   */
  private refreshProtocolsTick(protocolIds: string[]): void {
    this.refreshSubscription = this.refreshProtocols(protocolIds).subscribe(
      {
        complete: () => this.checkAndStartRefreshProtocol()
      }
    );
  }

  private refreshAllProtocols(): void {
    this.refreshProtocols(this.getProtocols().map(process => process.id)).subscribe();
  }

  private getProtocols(): LabProcess[] {
    const protocolNodes: PrWorkflowNodeProtocol[] = this.workflow.getAllProtocolNodes();
    return [this.getCurrentMainProtocol(), ...protocolNodes.map(node => node.currentObject as LabProcess)];
  }

  private refreshProtocols(protocolIds: string[]): Observable<LabProtocol> {
    const obs: Observable<LabProtocol>[] = protocolIds.map(id => this.protocolService.getProtocol(id));
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
    this.experimentSubscription?.unsubscribe();
  }

  /////////////////////////////////// FLOW ////////////////////////////////////

  public getOrLoadLayer$(protocolId: string): Observable<PrWorkflowLayer> {
    // if the layer was already loaded
    if (this.workflow.hasLayer(protocolId)) {
      return of(this.workflow.findLayerWithId(protocolId));
    } else {
      const node = this.workflow.findNodeByProcessId(protocolId);
      if (!(node instanceof PrWorkflowNodeProtocol)) {
        console.error('The node is not a protocol node');
        return of(null);
      }

      this.workflow.loadSubProtocolLayer(node, false);
      return node.getSubLayer$();
    }
  }

  private refreshProtocolSuccess(protocol: LabProtocol): void {

    const layer = this.workflow.findLayerWithId(protocol.id);
    if (layer) {
      for (const labProcess of Object.values(protocol.data.graph.nodes)) {
        const node: PrWorkflowNode = layer.findNodeByName(labProcess.instanceName);

        if (node == null) continue;
        node.updateObject(labProcess);
      }
    }

    // if the refreshed protocol is the main protocol, update the main protocol
    if (protocol.id === this.mainProtocol$.value?.id) {
      this.mainProtocol$.next(protocol);
    }
  }


  public getMainProtocol$(): Observable<LabProtocol> {
    return this.mainProtocol$.pipe(filter(protocol => protocol != null));
  }

  private getCurrentMainProtocol(): LabProtocol {
    return this.mainProtocol$.value;
  }


  ////////////////////// OTHER ///////////////////////
  public updateProcessConfig(protocolId: string, processInstanceName: string, config: PrConfigValues): void {
    const node = this.workflow.findNodeByName(protocolId, processInstanceName);

    if (node == null) {
      console.error(`Could not find node with name ${processInstanceName} in protocol ${protocolId}`);
      return;
    }

    if (!(node instanceof PrWorkflowNodeProcess)) {
      console.error(`Node with name ${processInstanceName} in protocol ${protocolId} is not a process node, it can't be configured`);
      return;
    }

    node.updateConfigValues(config);

    const obs = this.protocolService.saveProcessConfig(protocolId, processInstanceName, config);
    this.actionsService.addAction({
      type: 'workflow-save-config',
      action: obs,
      text: {text: 'biox.saving_config', translateText: true}
    });
  }


  public clear(): void {
    this.experiment$.complete();
    this.mainProtocol$.complete();
    this.experimentDescription$.complete();
    this.stopProtocolsRefresh();
    this.workflow?.destroy();
  }
}
