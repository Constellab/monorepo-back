import {Injectable} from '@angular/core';
import {BioxExperimentService} from '../../../../core/entity-service/biox-experiment.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {BioxExperiment} from '../../../../core/model/entities/biox-experiment.entity';
import {filter} from 'rxjs/operators';
import {BioxFlow} from '../../../../core/model/global/biox-connection.class';
import {BioxProtocol} from '../../../../core/model/entities/process/biox-protocol.entity';
import {BioxProtocolService} from '../../../../core/entity-service/biox-protocol.service';
import {BioxTag} from '../../../../core/model/entities/biox-tag.entity';

@Injectable()
export class BioxExperimentDetailPageState {

  private experiment$: BehaviorSubject<BioxExperiment>;

  // flow of the experiment
  private flow$: BehaviorSubject<BioxFlow<BioxProtocol>>;

  // does not emit experiment until ready is true
  private ready: boolean = false;

  constructor(private bioxExperimentService: BioxExperimentService,
              private bioxProtocolService: BioxProtocolService) {
  }

  public init(experimentId: string): void {
    this.ready = false;
    this.experiment$ = new BehaviorSubject(null);
    this.flow$ = new BehaviorSubject(null);
    this.bioxExperimentService.getExperiment(experimentId).subscribe(
      experiment => this.getExperimentSuccess(experiment),
      error => this.experiment$.error(error)
    );
  }

  private getExperimentSuccess(experiment: BioxExperiment): void {
    this.ready = true;
    this.experiment$.next(experiment);

    // load flow
    this.loadFlow(experiment.protocol.id);
  }

  public getExperiment$(): Observable<BioxExperiment> {
    return this.experiment$.asObservable().pipe(
      filter(() => this.ready)
    );
  }

  public get currentExperiment(): BioxExperiment {
    return this.experiment$.value;
  }


  public isEditable(): boolean {
    return this.currentExperiment.isEditable();
  }

  public updateExperiment(experiment: BioxExperiment): void {
    this.experiment$.next(experiment);
  }

  public updateTags(tags: BioxTag[]): void {
    this.experiment$.value.tags = tags;
  }

  /////////////////////////////////// FLOW ////////////////////////////////////

  private loadFlow(protocolId: string): void {
    this.bioxProtocolService.getProtocolAsFlow(protocolId).subscribe(
      flow => this.loadFlowSuccess(flow)
    );
  }

  private loadFlowSuccess(flow: BioxFlow<BioxProtocol>): void {
    this.flow$.next(flow);
  }


  public getFlow$(): Observable<BioxFlow<BioxProtocol>> {
    return this.flow$.asObservable().pipe(
      filter(flow => flow != null)
    );
  }

  public getFlowPromise(): Promise<BioxFlow<BioxProtocol>> {
    return this.getFlow$().toPromise();
  }

  ////////////////////// OTHER ///////////////////////
  public clear(): void {
    this.experiment$.complete();
    this.flow$.complete();
  }
}
