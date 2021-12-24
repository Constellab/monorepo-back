import {Component, Inject, OnInit} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
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
export class CaExperimentFormDialogComponent extends FlFormDialogAbstractDirective<Partial<CaExperiment>, CaExperiment>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: FlFormDialogInput<CaExperiment>,
              private experimentService: CaExperimentService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaExperimentFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'experiment_created', 'experiment_updated');
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<CaExperiment>> {
    return new FormBuilder().group({
      id: [null],
      title: [null, Validators.required],
      description: [null],
    });
  }

  create(): Observable<CaExperiment> {
    throw Error('Can\'t create an experiment');
  }

  update(formValue: Partial<CaExperiment>): Observable<CaExperiment> {
    return this.experimentService.update(formValue);
  }


  get title(): string {
    return this.isCreateMode() ? 'new_experiment' : 'update_experiment';
  }


}
