import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaLabInstance} from '../../../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {Observable} from 'rxjs';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';
import {CaReportService} from '../../../../../ca-core/service-api/ca-report.service';
import {map} from 'rxjs/operators';
import {FlArrayObs, FlEntityArrayObs} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-experiment-detail-page',
  templateUrl: './ca-experiment-detail-page.component.html',
  styleUrls: ['./ca-experiment-detail-page.component.scss']
})
export class CaExperimentDetailPageComponent implements OnInit {

  experimentId$: Observable<string>;
  experiment: CaExperiment;

  isLoading: boolean = true;

  reports: FlArrayObs<CaReport>;

  constructor(private route: ActivatedRoute,
              private experimentService: CaExperimentService,
              private reportService: CaReportService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.experimentId)
    );
    this.experimentId$ = this.route.params.pipe(
      map(params => params.experimentId)
    );
  }

  private init(id: string): void {
    this.getExperiment(id);
    this.reports = new FlEntityArrayObs(this.reportService.getReportsByExperiment(id));
  }

  private getExperiment(id: string): void {
    this.isLoading = true;
    this.experimentService.findById(id).subscribe(
      experiment => this.getExperimentSuccess(experiment),
      () => this.isLoading = false
    );
  }

  private getExperimentSuccess(experiment: CaExperiment): void {
    this.onExperimentUpdate(experiment);
    this.isLoading = false;
  }

  onExperimentUpdate(experiment: CaExperiment): void {
    this.experiment = experiment;
  }

  onLabInstanceUpdate(labInstance: CaLabInstance): void {
    this.experiment.labInstance = labInstance;
  }

}
