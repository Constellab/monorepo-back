import {Component, Input, OnInit} from '@angular/core';
import {LabProcess} from '../../../../../lab-core/model/entities/process/lab-process.entity';
import {Observable} from 'rxjs';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabProgressBar} from '../../../../../lab-core/model/entities/lab-progress-bar.entity';
import {map} from 'rxjs/operators';
import {
  LabProgressBarInfoDialogComponent
} from '../../../../../lab-core/entity-module/lab-progress-bar-core/component/lab-progress-bar-info-dialog/lab-progress-bar-info-dialog.component';
import {LabProcessService} from '../../../../../lab-core/entity-service/lab-process.service';
import {
  LabLogBetweenDatesDialogInput,
  LabLogsBetweenDatesDialogComponent
} from '../../../../../lab-core/entity-module/lab-log-core/lab-logs-between-dates-dialog/lab-logs-between-dates-dialog.component';
import {
  LabMonitorBetweenDatesDialogComponent,
  LabMonitorBetweenDatesDialogInput
} from '../../../../../lab-core/entity-module/lab-monitor-core/lab-monitor-between-dates-dialog/lab-monitor-between-dates-dialog.component';

@Component({
  selector: 'lab-workflow-node-progress',
  templateUrl: './lab-workflow-node-progress.component.html',
  styleUrls: ['./lab-workflow-node-progress.component.scss']
})
export class LabWorkflowNodeProgressComponent implements OnInit {

  @Input() process$: Observable<LabProcess>;

  elapsedTime$: Observable<number>;

  constructor(private dialogService: FlDialogService,
              private processService: LabProcessService) {
  }

  ngOnInit(): void {
    this.elapsedTime$ = this.process$.pipe(
      map(process => process.progressBar.elapsedTime)
    );
  }

  openProgressDetails(): void {
    const progressBar$: Observable<LabProgressBar> = this.process$.pipe(
      map(process => process.progressBar)
    );

    this.dialogService.openMediumDialog(LabProgressBarInfoDialogComponent, {data: progressBar$});
  }

  openProcessLogs(process: LabProcess): void {
    const input: LabLogBetweenDatesDialogInput = {
      title: process.instanceName,
      logs$: this.processService.getProcessLogs(process.getProcessType(), process.id),
      downloadUrl: this.processService.getDownloadProcessLogUrl(process.getProcessType(), process.id)
    };

    this.dialogService.openBigDialog(LabLogsBetweenDatesDialogComponent, {data: input});
  }

  openProcessMonitor(process: LabProcess): void {
    const input: LabMonitorBetweenDatesDialogInput = {
      title: process.instanceName,
      monitor$: this.processService.getProcessMonitor(process.getProcessType(), process.id)
    };

    this.dialogService.openBigDialog(LabMonitorBetweenDatesDialogComponent, {data: input});
  }
}
