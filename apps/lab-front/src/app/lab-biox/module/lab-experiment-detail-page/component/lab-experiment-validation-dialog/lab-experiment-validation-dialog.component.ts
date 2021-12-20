import {Component, Inject, OnInit} from '@angular/core';
import {LabProject} from '../../../../../lab-core/model/entities/lab-project.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {LabExperimentService} from '../../../../../lab-core/entity-service/lab-experiment.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {LabExperiment} from '../../../../../lab-core/model/entities/lab-experiment.entity';

export interface LabExperimentValidationDialogInput {
  experimentId: string;
  project?: LabProject;
}

/**
 * Small form dialog to validate an experiment, the user can select a project
 */
@Component({
  selector: 'lab-experiment-validation-dialog',
  templateUrl: './lab-experiment-validation-dialog.component.html',
  styleUrls: ['./lab-experiment-validation-dialog.component.scss']
})
export class LabExperimentValidationDialogComponent implements OnInit {

  formControl: FormControl<LabProject>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private dialogInput: LabExperimentValidationDialogInput,
              private dialogRef: MatDialogRef<LabExperimentValidationDialogComponent>,
              private experimentService: LabExperimentService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.initFormControl();
  }

  private initFormControl(): void {
    this.formControl = new FormControl<LabProject>(this.dialogInput.project, Validators.required);
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.isLoading = true;
      this.validateExperiment(this.formControl.value);
    }
  }

  private validateExperiment(project: LabProject): void {
    this.experimentService.validateExperiment(this.dialogInput.experimentId, project).subscribe(
      experiment => this.validateSuccess(experiment),
      () => this.isLoading = false
    );
  }

  private validateSuccess(experiment: LabExperiment): void {
    this.isLoading = false;
    this.snackBarService.openSuccessMessage('biox.experiment_validated', true);
    this.dialogRef.close(experiment);
  }

}
