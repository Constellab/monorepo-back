import {Injectable} from '@angular/core';
import {BioxExperimentService} from '../../../../core/entity-service/biox-experiment.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {BioxExperiment} from '../../../../core/model/entities/biox-experiment.entity';
import {filter} from 'rxjs/operators';

@Injectable()
export class BioxExperimentDetailPageState {

  experiment$: BehaviorSubject<BioxExperiment>;

  // does not emit experiment until ready is true
  ready: boolean = false;

  constructor(private bioxExperimentService: BioxExperimentService) {
  }

  public init(experimentId: string): void {
    this.experiment$ = new BehaviorSubject<BioxExperiment>(null);
    this.bioxExperimentService.getExperiment(experimentId).subscribe(
      experiment => this.getExperimentSuccess(experiment),
      error => this.experiment$.error(error)
    );
  }

  private getExperimentSuccess(experiment: BioxExperiment): void {
    this.ready = true;
    this.experiment$.next(experiment);
  }

  public getExperiment$(): Observable<BioxExperiment> {
    return this.experiment$.asObservable().pipe(
      filter(() => this.ready)
    );
  }

  public get currentExperiment(): BioxExperiment {
    return this.experiment$.value;
  }

  public clear(): void {
    this.experiment$.complete();
  }
}
