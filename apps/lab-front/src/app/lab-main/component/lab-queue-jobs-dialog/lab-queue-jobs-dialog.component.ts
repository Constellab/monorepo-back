import {Component, OnInit} from '@angular/core';
import {LabExperiment} from '../../../lab-core/model/entities/lab-experiment.entity';
import {
  FlArrayObs,
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlEntityArrayObs,
  FlTableColumn
} from '@monorepo/front-core-lib';
import {MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {LabQueueService} from '../../../lab-core/entity-service/lab-queue.service';
import {LabQueueJob} from '../../../lab-core/model/entities/lab-queue.entity';
import {LabExperimentService} from '../../../lab-core/entity-service/lab-experiment.service';

@Component({
  selector: 'lab-queue-jobs-dialog',
  templateUrl: './lab-queue-jobs-dialog.component.html',
  styleUrls: ['./lab-queue-jobs-dialog.component.scss']
})
export class LabQueueJobsDialogComponent implements OnInit {

  runningExperiments: FlArrayObs<LabExperiment>;
  experimentColumns: FlTableColumn<LabExperiment>[] = ['title', 'tags'];


  jobs: LabQueueJob[];

  isLoading: boolean = true;

  constructor(private dialogRef: MatDialogRef<LabQueueJobsDialogComponent>,
              private queueService: LabQueueService,
              private dialogService: FlDialogService,
              private experimentService: LabExperimentService) {
  }

  ngOnInit(): void {
    this.getJobs();
    this.runningExperiments = new FlEntityArrayObs(this.experimentService.getRunningExperiments());
  }

  private getJobs(): void {
    this.queueService.getQueueJobs().subscribe({
      next: jobs => this.getJobSuccess(jobs),
      error: () => this.isLoading = false
    });
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
}
