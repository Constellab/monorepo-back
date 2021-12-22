import {Component, OnInit} from '@angular/core';
import {LabReport} from '../../../../../lab-core/model/entities/lab-report.entity';
import {LabReportService} from '../../../../../lab-core/entity-service/lab-report.service';
import {ActivatedRoute} from '@angular/router';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  LabReportFormDialogComponent,
  LabReportFormDialogInput
} from '../../../../../lab-core/entity-module/lab-report-core/component/lab-report-form-dialog/lab-report-form-dialog.component';

@Component({
  selector: 'lab-report-detail-page',
  templateUrl: './lab-report-detail-page.component.html',
  styleUrls: ['./lab-report-detail-page.component.scss']
})
export class LabReportDetailPageComponent implements OnInit {

  report: LabReport;
  isLoading: boolean = true;

  saveIsLoading: boolean = false;

  constructor(private reportService: LabReportService,
              private route: ActivatedRoute,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );
  }

  private init(id: string): void {
    this.isLoading = true;
    this.reportService.getReport(id).subscribe(
      report => this.getSuccess(report),
      () => this.isLoading = false
    );
  }

  private getSuccess(report: LabReport): void {
    this.isLoading = false;
    this.report = report;
  }

  updateReport(): void {
    const input: LabReportFormDialogInput = {
      mode: 'update',
      reportId: this.report.id,
      object: {
        title: this.report.title
      }
    };

    this.dialogService.openSmallDialog(LabReportFormDialogComponent, {data: input}).afterClosed().subscribe(
      report => this.updateReportClosed(report)
    );
  }

  private updateReportClosed(report ?: LabReport): void {
    if (report) {
      this.report.title = report.title;
    }
  }

  saveReportContent(): void {
    if (this.saveIsLoading) return;
    this.saveIsLoading = true;
    this.reportService.updateContent(this.report.id, this.report.content).subscribe(
      () => this.saveIsLoading = false,
      () => this.saveIsLoading = false
    );
  }
}
