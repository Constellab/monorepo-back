import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LabReportService} from '../../../../../lab-core/entity-service/lab-report.service';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlPortalActionResult,
  FlPortalActionsService
} from '@monorepo/front-core-lib';
import {
  LabSelectExperimentDialogComponent
} from '../../../../../lab-core/entity-module/lab-experiment-core/component/lab-select-experiment-dialog/lab-select-experiment-dialog.component';
import {LabExperiment} from '../../../../../lab-core/model/entities/lab-experiment.entity';
import {Subscription} from 'rxjs';

/**
 * Component to list the associated experiment of a report with
 * the possibility to delete or add a new
 */
@Component({
  selector: 'lab-report-associated-experiments',
  templateUrl: './lab-report-associated-experiments.component.html',
  styleUrls: ['./lab-report-associated-experiments.component.scss']
})
export class LabReportAssociatedExperimentsComponent implements OnInit, OnDestroy {

  @Input() reportId: string;

  experiments: LabExperiment[] = [];
  isLoading: boolean = false;

  private readonly actionName: string = 'report-associate-experiment';

  private subscription: Subscription;

  constructor(private reportService: LabReportService,
              private dialogService: FlDialogService,
              private actionService: FlPortalActionsService) {
  }

  ngOnInit(): void {
    this.getExperiments();

    this.subscription = this.actionService.getResult$(this.actionName).subscribe(
      result => this.onAddAction(result)
    );
  }

  private onAddAction(result: FlPortalActionResult<LabExperiment>): void {
    if (result.status === 'success') {
      this.experiments.push(result.result);
    }
  }

  private getExperiments(): void {
    this.reportService.getExperimentByReports(this.reportId).subscribe(
      experiments => this.getExperimentSuccess(experiments),
      () => this.isLoading = false
    );
  }

  private getExperimentSuccess(experiments: LabExperiment[]): void {
    this.experiments = experiments;
    this.isLoading = false;
  }

  associateExperiment(): void {
    this.dialogService.openBigDialog(LabSelectExperimentDialogComponent).afterClosed().subscribe(
      experiment => this.selectExperimentClosed(experiment)
    );
  }

  private selectExperimentClosed(experiment?: LabExperiment): void {
    if (experiment) {
      this.actionService.addAction({
        type: this.actionName,
        action: this.reportService.addExperiment(this.reportId, experiment.id),
        text: {text: 'biox.report_associate_experiment', translateText: true},
      }, true);
    }
  }

  disassociateExperiment(experiment: LabExperiment, index: number): void {
    const input: FlConfirmDialogInput = {
      title: 'biox.report_disassociate_experiment',
      content: 'biox.report_disassociate_experiment_confirmation',
      translateTitleAndContent: true,
      observable: this.reportService.removeExperiment(this.reportId, experiment.id),
      successMessage: 'biox.report_experiment_disassociated',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.disassociateClosed(result, index)
    );
  }

  private disassociateClosed(result: FlConfirmDialogResult<void>, index: number): void {
    if (result.choice) {
      this.experiments.splice(index, 1);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
