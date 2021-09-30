import {Component, Inject, OnInit} from '@angular/core';
import {BioxStudy} from '../../../../../core/model/entities/biox-study.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {BioxExperimentService} from '../../../../../core/entity-service/biox-experiment.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {BioxExperiment} from '../../../../../core/model/entities/biox-experiment.entity';

export interface BioxExperimentValidationDialogInput {
  experimentId: string;
  study?: BioxStudy;
}

/**
 * Small form dialog to validate an experiment, the user can select a study
 */
@Component({
  selector: 'gen-biox-experiment-validation-dialog',
  templateUrl: './biox-experiment-validation-dialog.component.html',
  styleUrls: ['./biox-experiment-validation-dialog.component.scss']
})
export class BioxExperimentValidationDialogComponent implements OnInit {

  formControl: FormControl<BioxStudy>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private dialogInput: BioxExperimentValidationDialogInput,
              private dialogRef: MatDialogRef<BioxExperimentValidationDialogComponent>,
              private experimentService: BioxExperimentService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.initFormControl();
  }

  private initFormControl(): void {
    this.formControl = new FormControl<BioxStudy>(this.dialogInput.study, Validators.required);
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.isLoading = true;
      this.validateExperiment(this.formControl.value);
    }
  }

  private validateExperiment(study: BioxStudy): void {
    this.experimentService.validateExperiment(this.dialogInput.experimentId, study).subscribe(
      experiment => this.validateSuccess(experiment),
      () => this.isLoading = false
    );
  }

  private validateSuccess(experiment: BioxExperiment): void {
    this.isLoading = false;
    this.snackBarService.openSuccessMessage('biox.experiment_validated', true);
    this.dialogRef.close(experiment);
  }

}
