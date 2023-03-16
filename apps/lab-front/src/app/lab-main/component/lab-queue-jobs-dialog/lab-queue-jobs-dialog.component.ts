import {Component, OnDestroy, OnInit} from '@angular/core';
import {LabExperiment, LabRunningExperimentInfo} from '../../../lab-core/model/entities/lab-experiment.entity';
import {
  FlArrayObs,
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlEntityArrayObs
} from '@monorepo/front-core-lib';
import {LabQueueService} from '../../../lab-core/entity-service/lab-queue.service';
import {LabQueueJob} from '../../../lab-core/model/entities/lab-queue.entity';
import {LabExperimentService} from '../../../lab-core/entity-service/lab-experiment.service';
import {Subscription, tap, zip} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'lab-queue-jobs-dialog',
  templateUrl: './lab-queue-jobs-dialog.component.html',
  styleUrls: ['./lab-queue-jobs-dialog.component.scss']
})
export class LabQueueJobsDialogComponent implements OnInit, OnDestroy {

  runningExperiments: FlArrayObs<LabRunningExperimentInfo>;
  experimentColumns: string[] = ['title', 'runningTasks'];

  jobs: LabQueueJob[];

  isLoading: boolean = true;

  private refreshRate: number = 15000;
  private timer: any;
  private subscription: Subscription;

  constructor(private dialogRef: MatDialogRef<LabQueueJobsDialogComponent>,
              private queueService: LabQueueService,
              private dialogService: FlDialogService,
              private experimentService: LabExperimentService) {
  }

  ngOnInit(): void {
    this.loadInfo();
    this.runningExperiments = new FlEntityArrayObs();
  }

  private loadInfo(): void {
    const getJobs = this.queueService.getQueueJobs().pipe(tap({
      next: jobs => this.getJobSuccess(jobs),
      error: () => this.isLoading = false
    }));

    const getRunningExperiments = this.experimentService.getRunningExperiments().pipe(tap({
      next: experiments => this.runningExperiments.array = experiments,
    }));

    this.subscription = zip([getJobs, getRunningExperiments]).subscribe(() => this.getSuccess());
  }

  private getSuccess(): void {
    this.timer = setTimeout(() => this.loadInfo(), this.refreshRate);
  }

  private getJobSuccess(jobs: LabQueueJob[]): void {
    this.jobs = jobs;
    this.isLoading = false;
  }


  removeExperimentFromQueue(job: LabQueueJob, index: number): void {
    const input: FlConfirmDialogInput = {
      title: 'biox.remove_experiment_from_queue',
      content: 'biox.remove_experiment_from_queue_confirmation',
      translateTitleAndContent: true,
      observable: this.queueService.removeExperimentFromQueue(job.experiment.id),
      successMessage: 'biox.experiment_removed_from_queue',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onConfirmUpdateClosed(result, index)
    );
  }

  private onConfirmUpdateClosed(result: FlConfirmDialogResult<LabExperiment>, index: number): void {
    if (result.choice) {
      this.jobs.splice(index, 1);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    this.subscription?.unsubscribe();
  }


}
