import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {BioxExperiment} from '../../../../model/entities/biox-experiment.entity';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {BioxExperimentService} from '../../../../entity-service/biox-experiment.service';
import {Validators} from '@angular/forms';
import {ViewModel} from '../../../../model/global/view-model.entity';

/**
 * Dialog form to create or update an experiment
 */
@Component({
  selector: 'gen-biox-experiment-form-dialog',
  templateUrl: './biox-experiment-form-dialog.component.html',
  styleUrls: ['./biox-experiment-form-dialog.component.scss']
})
export class BioxExperimentFormDialogComponent extends FlFormDialogAbstractDirective<Partial<BioxExperiment>, ViewModel<BioxExperiment>>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: FlFormDialogInput<BioxExperiment>,
              private experimentService: BioxExperimentService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<BioxExperimentFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'biox.experiment_created', 'biox.experiment_updated');
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<BioxExperiment>> {
    return new FormBuilder().group({
      id: [null],
      title: [null, Validators.required],
      description: [null],
    });
  }

  create(formValue: Partial<BioxExperiment>): Observable<ViewModel<BioxExperiment>> {
    return this.experimentService.create(formValue);
  }

  update(formValue: Partial<BioxExperiment>): Observable<ViewModel<BioxExperiment>> {
    return this.experimentService.update(formValue);
  }

  get title(): string {
    return this.isCreateMode() ? 'biox.new_experiment' : 'biox.update_experiment';
  }

}
