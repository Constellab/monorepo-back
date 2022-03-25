import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {LabExperiment, LabExperimentSimpleForm} from '../../../../model/entities/lab-experiment.entity';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {LabExperimentService} from '../../../../entity-service/lab-experiment.service';
import {Validators} from '@angular/forms';

export interface LabExperimentFormDialogInput extends FlFormDialogInput<LabExperimentSimpleForm> {
  experimentId?: string;
}

/**
 * Dialog form to create or update an experiment
 */
@Component({
  selector: 'lab-experiment-form-dialog',
  templateUrl: './lab-experiment-form-dialog.component.html',
  styleUrls: ['./lab-experiment-form-dialog.component.scss']
})
export class LabExperimentFormDialogComponent extends FlFormDialogAbstractDirective<LabExperimentSimpleForm, LabExperiment>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: LabExperimentFormDialogInput,
              private experimentService: LabExperimentService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<LabExperimentFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<LabExperimentSimpleForm> {
    return new FormBuilder().group({
      title: [null, Validators.required],
      project: [null]
    });
  }

  create(formValue: LabExperimentSimpleForm): Observable<LabExperiment> {
    return this.experimentService.create(formValue);
  }

  update(formValue: LabExperimentSimpleForm): Observable<LabExperiment> {
    return this.experimentService.update(this.dialogInput.experimentId, formValue);
  }

  get title(): string {
    return this.isCreateMode() ? 'biox.new_experiment' : 'biox.update_experiment';
  }

  getCreateSuccessMessage(): string {
    return 'biox.experiment_created';
  }

  getUpdateSuccessMessage(): string {
    return 'biox.experiment_updated';
  }



}
