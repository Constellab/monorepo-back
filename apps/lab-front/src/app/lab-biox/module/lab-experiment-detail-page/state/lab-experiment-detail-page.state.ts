import {Injectable} from '@angular/core';
import {LabExperimentService} from '../../../../lab-core/entity-service/lab-experiment.service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {LabExperiment} from '../../../../lab-core/model/entities/lab-experiment.entity';
import {filter, map} from 'rxjs/operators';
import {LabFlow} from '../../../../lab-core/model/global/lab-connection.class';
import {LabProtocol} from '../../../../lab-core/model/entities/process/lab-protocol.entity';
import {LabProtocolService} from '../../../../lab-core/entity-service/lab-protocol.service';
import {LabTag} from '../../../../lab-core/model/entities/lab-tag.entity';
import {FlQuillJson} from '@monorepo/front-core-lib';

@Injectable()
export class LabExperimentDetailPageState {

  private experiment$: BehaviorSubject<LabExperiment>;
  private experimentDescription$: BehaviorSubject<FlQuillJson>;

  // flow of the experiment
  private mainFlow$: BehaviorSubject<LabFlow<LabProtocol>>;
  // observable where flow are emitted when there are retrieved form DB
  private flowChange$: Subject<LabFlow<LabProtocol>>;

  // save the list of sub flow where the key is the protocol id
  private subflows: Record<string, LabFlow<LabProtocol>>;

  // does not emit experiment until ready is true
  private ready: boolean = false;

  constructor(private experimentService: LabExperimentService,
              private protocolService: LabProtocolService) {
  }

  public init(experimentId: string): void {
    this.ready = false;
    this.experiment$ = new BehaviorSubject(null);
    this.experimentDescription$ = new BehaviorSubject(null);
    this.mainFlow$ = new BehaviorSubject(null);
    this.flowChange$ = new Subject();
    this.subflows = {};
    this.experimentService.getExperiment(experimentId).subscribe(
      experiment => this.getExperimentSuccess(experiment),
      error => this.experiment$.error(error)
    );
  }

  private getExperimentSuccess(experiment: LabExperiment): void {
    this.ready = true;
    this.experiment$.next(experiment);
    this.experimentDescription$.next(experiment.description);
    // load flow
    this.loadFlow(experiment.protocol.id);
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

  public updateExperiment(experiment: LabExperiment): void {
    if (experiment == null) return;
    this.experiment$.next(experiment);
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

  /////////////////////////////////// FLOW ////////////////////////////////////

  public loadFlow(protocolId: string): void {
    this.protocolService.getProtocolAsFlow(protocolId).subscribe(
      flow => this.getFlowSuccess(flow),
      error => this.mainFlow$.error(error)
    );
  }

  private getFlowSuccess(flow: LabFlow<LabProtocol>): void {
    // if this is the main flow
    if (this.mainFlow$.value == null || this.mainFlow$.value.object.id === flow.object.id) {

      // if the main flow is finished, refresh the experiment
      if (this.mainFlow$.value && flow.object.isFinished()) {
        this.refreshExperiment();
      }

      this.mainFlow$.next(flow);

    } else {
      // save the sub flow
      this.subflows[flow.object.id] = flow;
    }
    this.flowChange$.next(flow);
  }


  public getMainFlow$(): Observable<LabFlow<LabProtocol>> {
    return this.mainFlow$.asObservable().pipe(
      filter(flow => flow != null)
    );
  }

  /**
   * Notify each time of flow is retrieved
   */
  public getFlowUpdate$(): Observable<LabFlow<LabProtocol>> {
    return this.flowChange$.asObservable();
  }

  ////////////////////// OTHER ///////////////////////
  public clear(): void {
    this.experiment$.complete();
    this.mainFlow$.complete();
    this.flowChange$.complete();
    this.experimentDescription$.complete();
  }
}
