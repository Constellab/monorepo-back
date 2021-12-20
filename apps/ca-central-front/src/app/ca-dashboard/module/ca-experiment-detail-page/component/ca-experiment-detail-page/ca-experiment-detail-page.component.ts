import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Experiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaLabInstance} from '../../../../../ca-core/model/entities/ca-lab-instance.class';
import {
  CaStatusHistoryListDialogComponent,
  StatusHistoryListDialogInput
} from '../../../../../ca-core/module/ca-status/ca-status-history-list-dialog/ca-status-history-list-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-experiment-detail-page',
  templateUrl: './ca-experiment-detail-page.component.html',
  styleUrls: ['./ca-experiment-detail-page.component.scss']
})
export class CaExperimentDetailPageComponent implements OnInit {

  experiment: Experiment;

  isLoading: boolean = true;

  constructor(private route: ActivatedRoute,
              private experimentService: CaExperimentService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.getExperiment(params.id)
    );
  }

  private getExperiment(id: string): void {
    this.isLoading = true;
    this.experimentService.findById(id).subscribe(
      experiment => this.getExperimentSuccess(experiment),
      () => this.isLoading = false
    );
  }

  private getExperimentSuccess(experiment: Experiment): void {
    this.onExperimentUpdate(experiment);
    this.isLoading = false;
  }

  onExperimentUpdate(experiment: Experiment): void {
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
