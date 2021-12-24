import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaLabInstance} from '../../../../../ca-core/model/entities/ca-lab-instance.class';
import {
  CaStatusHistoryListDialogComponent,
  StatusHistoryListDialogInput
} from '../../../../../ca-core/module/ca-status/ca-status-history-list-dialog/ca-status-history-list-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';
import {CaReportService} from '../../../../../ca-core/service-api/ca-report.service';

@Component({
  selector: 'ca-experiment-detail-page',
  templateUrl: './ca-experiment-detail-page.component.html',
  styleUrls: ['./ca-experiment-detail-page.component.scss']
})
export class CaExperimentDetailPageComponent implements OnInit {

  experiment: CaExperiment;

  isLoading: boolean = true;

  reports$: Observable<CaReport[]>;

  constructor(private route: ActivatedRoute,
              private experimentService: CaExperimentService,
              private reportService: CaReportService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );
  }

  private init(id: string): void {
    this.getExperiment(id);
    this.reports$ = this.reportService.getReportsByExperiment(id);
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

  openStatusHistory(): void {
    const dialogInput: StatusHistoryListDialogInput = {
      statusHistoriesObs: this.experimentService.getStatusHistories(this.experiment.id),
    };
    this.dialogService.openSmallDialog(CaStatusHistoryListDialogComponent, {data: dialogInput});
  }

}
