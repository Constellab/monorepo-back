import {Injectable} from '@angular/core';
import {LabExperimentService} from '../../../../lab-core/entity-service/lab-experiment.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {LabExperiment} from '../../../../lab-core/model/entities/lab-experiment.entity';
import {filter} from 'rxjs/operators';
import {LabFlow} from '../../../../lab-core/model/global/lab-connection.class';
import {LabProtocol} from '../../../../lab-core/model/entities/process/lab-protocol.entity';
import {LabProtocolService} from '../../../../lab-core/entity-service/lab-protocol.service';
import {LabTag} from '../../../../lab-core/model/entities/lab-tag.entity';

@Injectable()
export class LabExperimentDetailPageState {

  private experiment$: BehaviorSubject<LabExperiment>;

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
    this.flow$ = new BehaviorSubject(null);
    this.experimentService.getExperiment(experimentId).subscribe(
      experiment => this.getExperimentSuccess(experiment),
      error => this.experiment$.error(error)
    );
  }

  private getExperimentSuccess(experiment: LabExperiment): void {
    this.ready = true;
    this.experiment$.next(experiment);

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


  public isEditable(): boolean {
    return this.currentExperiment.isEditable();
  }

  public updateExperiment(experiment: LabExperiment): void {
    this.experiment$.next(experiment);
  }

  public updateTags(tags: LabTag[]): void {
    this.experiment$.value.tags = tags;
  }

  /////////////////////////////////// FLOW ////////////////////////////////////

  private loadFlow(protocolId: string): void {
    this.protocolService.getProtocolAsFlow(protocolId).subscribe(
      flow => this.loadFlowSuccess(flow),
      error => this.flow$.error(error)
    );
  }

  private loadFlowSuccess(flow: LabFlow<LabProtocol>): void {
    this.flow$.next(flow);
  }


  public getFlow$(): Observable<LabFlow<LabProtocol>> {
    return this.flow$.asObservable().pipe(
      filter(flow => flow != null)
    );
  }

  public getFlowPromise(): Promise<LabFlow<LabProtocol>> {
    return this.getFlow$().toPromise();
  }

  ////////////////////// OTHER ///////////////////////
  public clear(): void {
    this.experiment$.complete();
    this.flow$.complete();
  }
}
