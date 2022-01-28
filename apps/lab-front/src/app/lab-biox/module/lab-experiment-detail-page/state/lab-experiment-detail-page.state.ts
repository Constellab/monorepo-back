import {Injectable} from '@angular/core';
import {LabExperimentService} from '../../../../lab-core/entity-service/lab-experiment.service';
import {BehaviorSubject, Observable} from 'rxjs';
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
  private flow$: BehaviorSubject<LabFlow<LabProtocol>>;

  // does not emit experiment until ready is true
  private ready: boolean = false;

  constructor(private experimentService: LabExperimentService,
              private protocolService: LabProtocolService) {
  }

  public init(experimentId: string): void {
    this.ready = false;
    this.experiment$ = new BehaviorSubject(null);
    this.experimentDescription$ = new BehaviorSubject(null);
    this.flow$ = new BehaviorSubject(null);
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

  public isEditable(): boolean {
    return this.currentExperiment.isEditable();
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

  /////////////////////////////////// FLOW ////////////////////////////////////

  private loadFlow(protocolId: string): void {
    this.protocolService.getProtocolAsFlow(protocolId).subscribe(
      flow => this.flow$.next(flow),
      error => this.flow$.error(error)
    );
  }


  public getFlow$(): Observable<LabFlow<LabProtocol>> {
    return this.flow$.asObservable().pipe(
      filter(flow => flow != null)
    );
  }

  ////////////////////// OTHER ///////////////////////
  public clear(): void {
    this.experiment$.complete();
    this.flow$.complete();
    this.experimentDescription$.complete();
  }
}
