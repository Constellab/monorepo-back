import {Component, OnInit} from '@angular/core';
import {LabExperiment, LabExperimentSimpleForm} from '../../../../../lab-core/model/entities/lab-experiment.entity';
import {
  LabExperimentFormDialogComponent,
  LabExperimentFormDialogInput
} from '../../../../../lab-core/entity-module/lab-experiment-core/component/lab-experiment-form-dialog/lab-experiment-form-dialog.component';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTagDialogService,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {
  LabProgressBarInfoDialogComponent
} from '../../../../../lab-core/entity-module/lab-progress-bar-core/component/lab-progress-bar-info-dialog/lab-progress-bar-info-dialog.component';
import {map} from 'rxjs/operators';
import {LabExperimentService} from '../../../../../lab-core/entity-service/lab-experiment.service';
import {LabRouterService} from '../../../../../lab-core/service/lab-router.service';
import {LabReport} from '../../../../../lab-core/model/entities/lab-report.entity';
import {
  LabReportFormDialogComponent,
  LabReportFormDialogInput
} from '../../../../../lab-core/entity-module/lab-report-core/component/lab-report-form-dialog/lab-report-form-dialog.component';
import {
  LabValidateObjectDialogComponent,
  LabValidateObjectDialogInput
} from '../../../../../lab-core/entity-module/lab-entity-core/component/lab-validate-object-dialog/lab-validate-object-dialog.component';
import {LabProject} from '../../../../../lab-core/model/entities/lab-project.class';
import {LabQueueService} from '../../../../../lab-core/entity-service/lab-queue.service';
import {
  LabLogBetweenDatesDialogInput,
  LabLogsBetweenDatesDialogComponent
} from '../../../../../lab-core/entity-module/lab-log-core/lab-logs-between-dates-dialog/lab-logs-between-dates-dialog.component';
import {
  LabMonitorBetweenDatesDialogComponent,
  LabMonitorBetweenDatesDialogInput
} from '../../../../../lab-core/entity-module/lab-monitor-core/lab-monitor-between-dates-dialog/lab-monitor-between-dates-dialog.component';
import {LabProcessService} from '../../../../../lab-core/entity-service/lab-process.service';

/**
 * Header for the experiment detail page
 */
@Component({
  selector: 'lab-experiment-detail-header',
  templateUrl: './lab-experiment-detail-header.component.html',
  styleUrls: ['./lab-experiment-detail-header.component.scss']
})
export class LabExperimentDetailHeaderComponent implements OnInit {

  experiment$: Observable<LabExperiment>;

  syncObjectFunc: (id: string) => Observable<LabExperiment>;


  constructor(private experimentState: LabExperimentDetailPageState,
              private dialogService: FlDialogService,
              private experimentService: LabExperimentService,
              private tagDialogService: FlTagDialogService,
              private routerService: LabRouterService,
              private queueService: LabQueueService,
              private translateService: FlTranslateService,
              private processService: LabProcessService) {
  }

  ngOnInit(): void {
    this.experiment$ = this.experimentState.getExperiment$();
    this.syncObjectFunc = (id: string) => this.experimentService.syncWithCentral(id);
  }

  openUpdateDialog(): void {
    const experiment: LabExperiment = this.experimentState.currentExperiment;

    const experimentForm: LabExperimentSimpleForm = {
      title: experiment.title,
      project: experiment.project
    };
    const input: LabExperimentFormDialogInput = {
      object: experimentForm,
      mode: 'update',
      experimentId: experiment.id,
      disabledProject: experiment.isSynced
    };

    this.dialogService.openSmallDialog(LabExperimentFormDialogComponent,
      {data: input, panelClass: 'g-dialog-allow-overflow'}).afterClosed().subscribe(
      result => this.onExperimentUpdate(result)
    );
  }

  openValidationDialog(): void {
    const experiment: LabExperiment = this.experimentState.currentExperiment;

    const input: LabValidateObjectDialogInput = {
      title: 'biox.validate_experiment',
      validate: (project: LabProject): Observable<any> =>
        this.experimentService.validateExperiment(experiment.id, project.id),
      project: experiment.project,
      helpText: 'biox.validate_experiment_help_text',
      successMessage: 'biox.experiment_validated'
    };

    this.dialogService.openSmallDialog(LabValidateObjectDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.onExperimentUpdate(result)
    );
  }

  removeExperimentFromQueue(): void {
    const experiment: LabExperiment = this.experimentState.currentExperiment;

    const input: FlConfirmDialogInput = {
      title: 'biox.remove_experiment_from_queue',
      content: 'biox.remove_experiment_from_queue_confirmation',
      translateTitleAndContent: true,
      observable: this.queueService.removeExperimentFromQueue(experiment.id),
      successMessage: 'biox.experiment_removed_from_queue',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onConfirmUpdateClosed(result)
    );
  }

  private onConfirmUpdateClosed(result: FlConfirmDialogResult<LabExperiment>): void {
    if (result.choice) {
      this.experimentState.updateExperiment(result.result);
    }
  }

  onExperimentUpdate(experiment?: LabExperiment): void {
    if (experiment) {
      this.experimentState.updateExperiment(experiment);
    }
  }


  openTagsFormDialog(): void {
    const experiment = this.experimentState.currentExperiment;
    this.tagDialogService.openUpdateTagDialog({
      tags: experiment.tags,
      updateMethod: (tags) => this.experimentService.saveTags(experiment.id, tags)
    }).afterClosed().subscribe(
      newTags => {
        if (newTags != null) {
          this.experimentState.updateTags(newTags);
        }
      }
    );
  }

  openDuplicateConfirmation(): void {
    const experiment = this.experimentState.currentExperiment;

    const input: FlConfirmDialogInput = {
      title: 'biox.clone_experiment',
      content: 'biox.clone_experiment_confirmation',
      translateTitleAndContent: true,
      observable: this.experimentService.cloneExperiment(experiment.id),
      successMessage: 'biox.experiment_cloned',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDuplicateClosed(result)
    );
  }

  private onDuplicateClosed(result: FlConfirmDialogResult<LabExperiment>): void {
    if (result.choice) {
      this.routerService.navigateToExperimentDetail(result.result.id);
    }
  }

  openCreateReport(): void {
    const experiment = this.experimentState.currentExperiment;

    const input: LabReportFormDialogInput = {
      mode: 'create',
      experimentId: this.experimentState.currentExperiment.id,
      project: experiment.project
    };

    this.dialogService.openSmallDialog(LabReportFormDialogComponent, {data: input}).afterClosed().subscribe(
      report => this.onReportCreateClosed(report)
    );
  }

  private onReportCreateClosed(report?: LabReport): void {
    if (report) {
      this.routerService.navigateToReportDetail(report.id);
    }
  }

  resetExperiment(): void {
    const data: FlConfirmDialogInput = {
      title: 'biox.reset_experiment',
      content: 'biox.reset_experiment_confirmation',
      translateTitleAndContent: true,
      observable: this.experimentService.resetExperiment(this.experimentState.currentExperiment.id),
      successMessage: 'biox.experiment_reset',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      (result: FlConfirmDialogResult) => this.onExperimentReset(result.result)
    );
  }

  private onExperimentReset(experiment?: LabExperiment): void {
    if (experiment) {
      this.experimentState.updateExperiment(experiment, true);
    }
  }

  deleteExperiment(): void {
    const experiment = this.experimentState.currentExperiment;

    let content = `</p>${this.translateService.translate('biox.delete_experiment_confirmation')}</p>`;

    if (experiment.isSynced) {
      content += `<p>${this.translateService.translate('biox.delete_experiment_sync_confirmation')}</p>`;
    }


    const data: FlConfirmDialogInput = {
      title: this.translateService.translate('biox.delete_experiment'),
      content: content,
      translateTitleAndContent: false,
      observable: this.experimentService.deleteExperiment(experiment.id),
      successMessage: 'biox.experiment_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onDeleteSuccess(result)
    );
  }

  private onDeleteSuccess(result: FlConfirmDialogResult): void {
    if (result.choice) {
      this.routerService.navigateToExperimentListRoute();
    }
  }

  openProgressInformation(): void {
    this.dialogService.openMediumDialog(LabProgressBarInfoDialogComponent,
      {
        data:
          this.experimentState.getMainProtocol$().pipe(
            map(flow => flow.progressBar)
          )
      });
  }

  openProcessLogs(experiment: LabExperiment): void {
    const input: LabLogBetweenDatesDialogInput = {
      title: experiment.title,
      logs$: this.processService.getProcessLogs('PROTOCOL', experiment.protocol.id),
      downloadUrl: this.processService.getDownloadProcessLogUrl('PROTOCOL', experiment.protocol.id)
    };

    this.dialogService.openBigDialog(LabLogsBetweenDatesDialogComponent, {data: input});
  }

  openProcessMonitor(experiment: LabExperiment): void {
    const input: LabMonitorBetweenDatesDialogInput = {
      title: experiment.title,
      monitor$: this.processService.getProcessMonitor('PROTOCOL', experiment.protocol.id)
    };

    this.dialogService.openBigDialog(LabMonitorBetweenDatesDialogComponent, {data: input});
  }

}
