import {Component, Inject, OnInit} from '@angular/core';
import {Experiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Validators} from '@angular/forms';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {Observable} from 'rxjs';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * Dialog form to create or update an experiment
 */
@Component({
  selector: 'ca-experiment-form-dialog',
  templateUrl: './ca-experiment-form-dialog.component.html',
  styleUrls: ['./ca-experiment-form-dialog.component.scss']
})
export class CaExperimentFormDialogComponent extends FlFormDialogAbstractDirective<Partial<Experiment>, Experiment>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: FlFormDialogInput<Experiment>,
              private experimentService: CaExperimentService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaExperimentFormDialogComponent>) {
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
    });
  }

  create(): Observable<Experiment> {
    throw Error('Can\'t create an experiment');
  }

  update(formValue: Partial<Experiment>): Observable<Experiment> {
    return this.experimentService.update(formValue);
  }


  get title(): string {
    return this.isCreateMode() ? 'new_experiment' : 'update_experiment';
  }


}
