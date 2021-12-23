import {Injectable, OnDestroy} from '@angular/core';
import {LabReportService} from '../../../lab-core/entity-service/lab-report.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {LabReport, LabReportContent} from '../../../lab-core/model/entities/lab-report.entity';
import {filter} from 'rxjs/operators';

@Injectable()
export class LabReportDetailPageState implements OnDestroy {

  private report$: BehaviorSubject<LabReport> = new BehaviorSubject(null);
  private reportContent$: BehaviorSubject<LabReportContent> = new BehaviorSubject(null);

  constructor(private reportService: LabReportService) {
  }

  public init(reportId: string): void {
    this.reportService.getReport(reportId).subscribe(
      report => this.getReportSuccess(report),
      (error) => this.report$.error(error)
    );
  }

  private getReportSuccess(report: LabReport): void {
    this.report$.next(report);
    this.reportContent$.next(report.content);
  }

  public get currentReport(): LabReport {
    return this.report$.value;
  }

  public getReport$(): Observable<LabReport> {
    return this.report$.asObservable().pipe(filter(report => report != null));
  }

  public getContent$(): Observable<LabReportContent> {
    return this.reportContent$.asObservable().pipe(filter(report => report != null));
  }

  public updateReport(report: LabReport): void {
    const currentReport = this.currentReport;
    currentReport.title = report.title;
    currentReport.isValidated = report.isValidated;
    this.report$.next(currentReport);
  }

  public updateContent(content: LabReportContent): void {
    this.reportContent$.next(content);
  }

  ngOnDestroy(): void {
    this.report$.complete();
    this.reportContent$.complete();
  }


}
