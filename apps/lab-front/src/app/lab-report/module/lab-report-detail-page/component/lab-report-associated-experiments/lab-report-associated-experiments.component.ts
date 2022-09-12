import {Component, OnDestroy, OnInit} from '@angular/core';
import {LabReportService} from '../../../../../lab-core/entity-service/lab-report.service';
import {
  FlArrayObs,
  FlConfirmDialogResult,
  FlDialogService,
  FlEntityArrayObs,
  FlPortalActionResult,
  FlPortalActionsService,
  FlTableColumn
} from '@monorepo/front-core-lib';
import {
  LabSelectExperimentDialogComponent
} from '../../../../../lab-core/entity-module/lab-experiment-core/component/lab-select-experiment-dialog/lab-select-experiment-dialog.component';
import {LabExperiment} from '../../../../../lab-core/model/entities/lab-experiment.entity';
import {Subscription} from 'rxjs';
import {LabReportDetailPageState} from '../../lab-report-detail-page.state';

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

  experiments: FlArrayObs<LabExperiment>;

  canEdit: boolean = false;

  columns: FlTableColumn<LabExperiment>[];

  private readonly actionName: string = 'report-associate-experiment';

  private subscription: Subscription;

  constructor(private state: LabReportDetailPageState,
              private reportService: LabReportService,
              private dialogService: FlDialogService,
              private actionService: FlPortalActionsService) {
  }

  ngOnInit(): void {
    // refresh the can edit bool
    this.state.getReport$().subscribe(
      report => {
        this.canEdit = !report.isValidated;
        this.columns = this.canEdit ? ['title', 'disassociate'] : ['title'];
      }
    );

    this.experiments = new FlEntityArrayObs(this.reportService.getExperimentByReports(this.state.currentReport.id));

    this.subscription = this.actionService.getResult$(this.actionName).subscribe(
      result => this.onAddAction(result)
    );
  }

  private onAddAction(result: FlPortalActionResult<LabExperiment>): void {
    if (result.status === 'success') {
      this.experiments.addItem(result.result);
    }
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
        action: this.reportService.addExperiment(this.state.currentReport.id, experiment.id),
        text: {text: 'biox.report_associate_experiment', translateText: true},
      }, true);
    }
  }

  disassociateExperiment(experiment: LabExperiment): void {
    this.reportService.removeExperimentWithConfirmation(this.state.currentReport.id, experiment.id).subscribe(
      result => this.disassociateClosed(result, experiment)
    );
  }

  private disassociateClosed(result: FlConfirmDialogResult<void>, experiment: LabExperiment): void {
    if (result.choice) {
      this.experiments.removeItem(experiment);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
