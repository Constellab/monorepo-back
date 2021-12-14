import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Experiment, ExperimentStatus, experimentStatusDict} from '../../../../../core/model/entities/experiment.class';
import {ExperimentService} from '../../../../service/experiment.service';
import {
  ExperimentFormDialogComponent,
  ExperimentFormDialogInput
} from '../../../experiment-core/component/experiment-form-dialog/experiment-form-dialog.component';
import {
  UpdateStatusFormDialogComponent,
  UpdateStatusFormDialogInput
} from '../../../../../core/module/status/update-status-form-dialog/update-status-form-dialog.component';
import {LabIframeOptions, RouterService} from '../../../../../core/service/router.service';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService} from '@monorepo/front-core-lib';

/**
 * Detail card of the experiment used in the experiment page
 */
@Component({
  selector: 'gen-experiment-card-detail',
  templateUrl: './experiment-card-detail.component.html',
  styleUrls: ['./experiment-card-detail.component.scss']
})
export class ExperimentCardDetailComponent implements OnInit {

  @Input() experiment: Experiment;
  @Output() update: EventEmitter<Experiment> = new EventEmitter<Experiment>();

  openInLabLink: string;
  linkQueryParams: LabIframeOptions;

  constructor(private dialogService: FlDialogService,
              private experimentService: ExperimentService,
              private routerService: RouterService) {
  }

  ngOnInit(): void {
    if (this.experiment.labInstance.isRunning()) {
      this.openInLabLink = RouterService.getLabIframeRoute(this.experiment.labInstance.id);
      this.linkQueryParams = {objectType: 'experiment', objectId: this.experiment.id};
    }
  }

  // can't start if protocol is not defined or the lab is not running
  get disabledStartButton(): boolean {
    return this.disabledStartButtonText != null;
  }

  get disabledStartButtonText(): string {
    if (!this.experiment.hasProtocol()) {
      return 'protocol_not_defined';
    } else if (!this.experiment.labInstance.isRunning()) {
      return 'lab_must_run';
    }
    return null;
  }

  openUpdateExperimentDialog(): void {
    const dialogInput: ExperimentFormDialogInput = {
      mode: 'update',
      object: this.experiment,
    };
    this.dialogService.openSmallDialog(ExperimentFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      newExp => this.onUpdateDialogClosed(newExp)
    );
  }

  openUpdateStatusDialog(): void {
    const dialogInput: UpdateStatusFormDialogInput<ExperimentStatus> = {
      statusDict: experimentStatusDict,
      currentStatus: this.experiment.currentStatus.status,
      updateStatus: this.experimentService.getUpdateStatusMethod(this.experiment.id),
      title: 'update_experiment_status'
    };
    this.dialogService.openSmallDialog(UpdateStatusFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      newExp => this.onUpdateDialogClosed(newExp)
    );
  }

  private onUpdateDialogClosed(experiment: Experiment): void {
    if (experiment) {
      this.update.emit(experiment);
    }
  }

  startExperiment(): void {
    const dialogInput: FlConfirmDialogInput = {
      title: 'start_experiment',
      content: 'start_experiment_confirmation',
      translateTitleAndContent: true,
      observable: this.experimentService.startExperiment(this.experiment.id),
      successMessage: 'experiment_started',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(dialogInput).afterClosed().subscribe(
      result => this.onStartExperimentClosed(result)
    );
  }

  private onStartExperimentClosed(result: FlConfirmDialogResult<Experiment>): void {
    if (result.choice) {
      const experiment: Experiment = result.result;
      this.routerService.navigateToLabIframe(experiment.labInstance.id,
        {objectType: 'experiment', objectId: experiment.id});
    }
  }

}
