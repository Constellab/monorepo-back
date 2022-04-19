import {Component, OnDestroy, OnInit} from '@angular/core';
import {LabReport, LabReportContent} from '../../../../../lab-core/model/entities/lab-report.entity';
import {LabReportService} from '../../../../../lab-core/entity-service/lab-report.service';
import {ActivatedRoute} from '@angular/router';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDebouncer,
  FlDialogService,
  FlTextEditorConfig
} from '@monorepo/front-core-lib';
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
import {LabReportTextEditorConfig} from '../../lab-report-text-editor-config.class';

@Component({
  selector: 'lab-report-detail-page',
  templateUrl: './lab-report-detail-page.component.html',
  styleUrls: ['./lab-report-detail-page.component.scss'],
  providers: [LabReportDetailPageState]
})
export class LabReportDetailPageComponent implements OnInit, OnDestroy {

  report$: Observable<LabReport>;
  content: LabReportContent;

  textEditorConfig: FlTextEditorConfig;

  private contentDebouncer: FlDebouncer<LabReportContent>;

  constructor(private reportService: LabReportService,
              private state: LabReportDetailPageState,
              private route: ActivatedRoute,
              private dialogService: FlDialogService,
              private routerService: LabRouterService,
              textEditorConfig: LabReportTextEditorConfig) {
    this.textEditorConfig = textEditorConfig;
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );

    // create a debouncer to save the description after x second of idle
    this.contentDebouncer = new FlDebouncer(FlDebouncer.AUTO_SAVE_DEBOUNCE_TIME);
    this.contentDebouncer.getDebouncedValue().subscribe(
      value => this.saveContent(value)
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
        title: report.title,
        project: report.project
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

  onContentUpdate(content: LabReportContent): void {
    this.contentDebouncer.setValue(content);
  }

  saveContent(content: LabReportContent): void {
    this.reportService.updateContent(this.state.currentReport.id, content).subscribe(
      (value) => this.saveContentSuccess(value.content),
    );
  }

  private saveContentSuccess(content: LabReportContent): void {
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

  printReport(): void {
    if (window) {
      window.print();
    }
  }

  ngOnDestroy(): void {
    this.contentDebouncer.complete();
  }


}
