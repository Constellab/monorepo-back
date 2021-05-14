import {Injectable} from '@angular/core';
import {BioxExperimentService} from '../../../../core/entity-service/biox-experiment.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {BioxExperiment, BioxExperimentVM} from '../../../../core/model/entities/biox-experiment.entity';
import {filter} from 'rxjs/operators';

@Injectable()
export class BioxExperimentDetailPageState {

  experiment$: BehaviorSubject<BioxExperimentVM>;

  // does not emit experiment until ready is true
  ready: boolean = false;

  constructor(private bioxExperimentService: BioxExperimentService) {
  }

  public init(experimentId: string): void {
    this.experiment$ = new BehaviorSubject<BioxExperimentVM>(null);
    this.bioxExperimentService.getExperiment(experimentId).subscribe(
      experiment => this.getExperimentSuccess(experiment),
      error => this.experiment$.error(error)
    );
  }

  private getExperimentSuccess(experiment: BioxExperimentVM): void {
    this.ready = true;
    this.experiment$.next(experiment);
  }

  public getExperiment$(): Observable<BioxExperimentVM> {
    return this.experiment$.asObservable().pipe(
      filter(() => this.ready)
    );
  }

  public get currentExperimentVM(): BioxExperimentVM{
    return this.experiment$.value;
  }

  public get currentExperiment(): BioxExperiment{
    return this.currentExperimentVM.model;
  }

  public clear(): void{
    this.experiment$.complete();
  }
}
