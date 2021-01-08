import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Experiment} from '../../../../../core/model/entities/experiment.class';
import {ExperimentService} from '../../../../service/experiment.service';
import {LabInstance} from '../../../../../core/model/entities/lab-instance.class';
import {
  StatusHistoryListDialogComponent,
  StatusHistoryListDialogInput
} from '../../../../../core/module/status/status-history-list-dialog/status-history-list-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-experiment-detail-page',
  templateUrl: './experiment-detail-page.component.html',
  styleUrls: ['./experiment-detail-page.component.scss']
})
export class ExperimentDetailPageComponent implements OnInit {

  experiment: Experiment;

  showProtocolForm: boolean = false;

  isLoading: boolean = true;

  constructor(private route: ActivatedRoute,
              private experimentService: ExperimentService,
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
    this.showProtocolForm = experiment.statusIsDraft();
  }

  onLabInstanceUpdate(labInstance: LabInstance): void {
    this.experiment.labInstance = labInstance;
  }

  openStatusHistory(): void {
    const dialogInput: StatusHistoryListDialogInput = {
      statusHistoriesObs: this.experimentService.getStatusHistories(this.experiment.id),
    };
    this.dialogService.openSmallDialog(StatusHistoryListDialogComponent, {data: dialogInput});
  }

}
