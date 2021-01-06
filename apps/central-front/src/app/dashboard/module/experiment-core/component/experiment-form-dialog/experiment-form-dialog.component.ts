import {Component, Inject, OnInit} from '@angular/core';
import {FormDialogInput} from '../../../../../core/model/global/form.class';
import {Experiment} from '../../../../../core/model/entities/experiment.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SnackBarService} from '../../../../../core/service/snack-bar.service';
import {Validators} from '@angular/forms';
import {ExperimentService} from '../../../../service/experiment.service';
import {FormDialogAbstractDirective} from '../../../../../core/abstract-directive/form-dialog-abstract.directive';
import {Observable} from 'rxjs';

export interface ExperimentFormDialogInput extends FormDialogInput<Experiment> {
  studyId?: string;
}

/**
 * Dialog form to create or update an experiment
 */
@Component({
  selector: 'gen-experiment-form-dialog',
  templateUrl: './experiment-form-dialog.component.html',
  styleUrls: ['./experiment-form-dialog.component.scss']
})
export class ExperimentFormDialogComponent extends FormDialogAbstractDirective<Partial<Experiment>, Experiment>
  implements OnInit {

  formGp: FormGroup<Partial<Experiment>>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: ExperimentFormDialogInput,
              private experimentService: ExperimentService,
              snackBarService: SnackBarService,
              dialogRef: MatDialogRef<ExperimentFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'experiment_created', 'experiment_updated');
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<Experiment>> {
    return new FormBuilder().group({
      id: [null],
      label: [null, Validators.required],
      description: [null],
      labInstance: [{value: null, disabled: this.isUpdateMode()}, Validators.required],
    });
  }

  create(formValue: Partial<Experiment>): Observable<Experiment> {
    return this.experimentService.create(formValue, this.dialogInput.studyId);
  }

  update(formValue: Partial<Experiment>): Observable<Experiment> {
    return this.experimentService.update(formValue);
  }


  get title(): string {
    return this.isCreateMode() ? 'new_experiment' : 'update_experiment';
  }


}
