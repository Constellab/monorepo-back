import {Component, OnInit} from '@angular/core';
import {LabReport, LabReportContent} from '../../../../../lab-core/model/entities/lab-report.entity';
import {LabReportService} from '../../../../../lab-core/entity-service/lab-report.service';
import {ActivatedRoute} from '@angular/router';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService} from '@monorepo/front-core-lib';
import {
  LabReportFormDialogComponent,
  LabReportFormDialogInput
} from '../../../../../lab-core/entity-module/lab-report-core/component/lab-report-form-dialog/lab-report-form-dialog.component';
import {LabRouterService} from '../../../../../lab-core/service/lab-router.service';
import {LabReportDetailPageState} from '../../lab-report-detail-page.state';
import {Observable} from 'rxjs';
import {
  LabValidateObjectDialogComponent,
  LabValidateObjectDialogInput
} from '../../../../../lab-core/entity-module/lab-project-core/component/lab-validate-object-dialog/lab-validate-object-dialog.component';
import {LabProject} from '../../../../../lab-core/model/entities/lab-project.class';

@Component({
  selector: 'lab-report-detail-page',
  templateUrl: './lab-report-detail-page.component.html',
  styleUrls: ['./lab-report-detail-page.component.scss'],
  providers: [LabReportDetailPageState]
})
export class LabReportDetailPageComponent implements OnInit {

  report$: Observable<LabReport>;
  content: LabReportContent;

  saveContentIsLoading: boolean = false;

  constructor(private reportService: LabReportService,
              private state: LabReportDetailPageState,
              private route: ActivatedRoute,
              private dialogService: FlDialogService,
              private routerService: LabRouterService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );
  }

  private init(id: string): void {
    this.state.init(id);
    this.report$ = this.state.getReport$();
    this.state.getContent$().subscribe(
      content => this.content = content
    );
  }


  updateReport(): void {
    const report: LabReport = this.state.currentReport;
    const input: LabReportFormDialogInput = {
      mode: 'update',
      reportId: report.id,
      object: {
        title: report.title
      }
    };

    this.dialogService.openSmallDialog(LabReportFormDialogComponent, {data: input}).afterClosed().subscribe(
      report => this.updateReportClosed(report)
    );
  }

  private updateReportClosed(report ?: LabReport): void {
    if (report) {
      this.state.updateReport(report);
    }
  }

  saveReportContent(): void {
    if (this.saveContentIsLoading) return;
    this.saveContentIsLoading = true;
    this.reportService.updateContent(this.state.currentReport.id, this.content).subscribe(
      () => this.saveContentSuccess(this.content),
      () => this.saveContentIsLoading = false
    );
  }

  private saveContentSuccess(content: LabReportContent): void {
    this.saveContentIsLoading = false;
    this.state.updateContent(content);
  }

  validate(): void {
    const report = this.state.currentReport;

    const input: LabValidateObjectDialogInput = {
      title: 'biox.validate_report',
      validate: (project: LabProject): Observable<any> => this.reportService.validate(report.id, project),
      project: report.project,
      helpText: 'biox.validate_report_help_text',
      successMessage: 'biox.report_validated'
    };

    this.dialogService.openSmallDialog(LabValidateObjectDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.validatedClosed(result)
    );
  }

  private validatedClosed(report?: LabReport): void {
    if (report) {
      this.state.updateReport(report);
    }
  }

  delete(): void {
    const input: FlConfirmDialogInput = {
      title: 'biox.delete_report',
      content: 'biox.delete_report_confirmation',
      translateTitleAndContent: true,
      observable: this.reportService.delete(this.state.currentReport.id),
      successMessage: 'biox.report_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.deletedClosed(result)
    );
  }

  private deletedClosed(result: FlConfirmDialogResult<LabReport>): void {
    if (result.choice) {
      this.routerService.navigateToReportSearch();
    }
  }
}
