import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LabReport} from '../../../../../lab-core/model/entities/lab-report.entity';
import {
  FlConfirmDialogResult,
  FlDialogService,
  FlEntityArrayObs,
  FlPortalActionResult,
  FlPortalActionsService,
  FlTableColumn
} from '@monorepo/front-core-lib';
import {Subscription} from 'rxjs';
import {LabReportService} from '../../../../../lab-core/entity-service/lab-report.service';
import {map} from 'rxjs/operators';
import {
  LabSelectReportDialogComponent
} from '../../../../../lab-core/entity-module/lab-report-core/component/lab-select-report-dialog/lab-select-report-dialog.component';

/**
 * Component inside the experiment detail to list the reports associated with the experiment
 */
@Component({
  selector: 'lab-experiment-associated-reports',
  templateUrl: './lab-experiment-associated-reports.component.html',
  styleUrls: ['./lab-experiment-associated-reports.component.scss']
})
export class LabExperimentAssociatedReportsComponent implements OnInit, OnDestroy {

  @Input() experimentId: string;

  reports: FlEntityArrayObs<LabReport>;

  columns: FlTableColumn<LabReport>[] = ['title', 'disassociate'];

  private readonly actionName: string = 'experiment-associate-report';

  private subscription: Subscription;

  constructor(private reportService: LabReportService,
              private dialogService: FlDialogService,
              private actionService: FlPortalActionsService) {
  }

  ngOnInit(): void {
    this.subscription = this.actionService.getResult$(this.actionName).subscribe(
      result => this.onAddAction(result)
    );

    this.reports = new FlEntityArrayObs(this.reportService.getByExperiment(this.experimentId));
  }

  private onAddAction(result: FlPortalActionResult<LabReport>): void {
    if (result.status === 'success') {
      this.reports.addItem(result.result);
    }
  }

  associateExperiment(): void {
    this.dialogService.openBigDialog(LabSelectReportDialogComponent).afterClosed().subscribe(
      report => this.selectReportClosed(report)
    );
  }

  private selectReportClosed(report?: LabReport): void {
    if (report) {
      this.actionService.addAction({
        type: this.actionName,
        action: this.reportService.addExperiment(report.id, this.experimentId).pipe(
          map(() => report) // map the report to get it after the action
        ),
        text: {text: 'biox.experiment_associate_report', translateText: true},
      }, true);
    }
  }

  disassociateReport(report: LabReport): void {
    this.reportService.removeExperimentWithConfirmation(report.id, this.experimentId).subscribe(
      result => this.disassociateClosed(result, report)
    );
  }

  private disassociateClosed(result: FlConfirmDialogResult<void>, report: LabReport): void {
    if (result.choice) {
      this.reports.removeItem(report);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
