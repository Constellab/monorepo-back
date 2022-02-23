import {Component, Inject, OnInit} from '@angular/core';
import {LabProject} from '../../../../model/entities/lab-project.class';
import {Observable} from 'rxjs';
import {FormControl} from '@ngneat/reactive-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabExperimentService} from '../../../../entity-service/lab-experiment.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {Validators} from '@angular/forms';

export interface LabValidateObjectDialogInput {
  title: string;

  helpText?: string;

  validate(project: LabProject): Observable<any>;

  successMessage: string;

  project?: LabProject;
}

/**
 * Generic dialog to validate an object by selecting a project.
 * This works for experiments and reports
 */
@Component({
  selector: 'lab-validate-object-dialog',
  templateUrl: './lab-validate-object-dialog.component.html',
  styleUrls: ['./lab-validate-object-dialog.component.scss']
})
export class LabValidateObjectDialogComponent implements OnInit {

  title: string;
  helpText: string;

  formControl: FormControl<LabProject>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private dialogInput: LabValidateObjectDialogInput,
              private dialogRef: MatDialogRef<LabValidateObjectDialogComponent>,
              private experimentService: LabExperimentService,
              private snackBarService: FlSnackBarService) {
    this.title = this.dialogInput.title;
    this.helpText = this.dialogInput.helpText;
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
      this.validateObject(this.formControl.value);
    }
  }

  private validateObject(project: LabProject): void {
    this.dialogInput.validate(project).subscribe(
      object => this.validateSuccess(object),
      () => this.isLoading = false
    );
  }

  private validateSuccess(object: any): void {
    this.isLoading = false;
    this.snackBarService.openSuccessMessage({text:this.dialogInput.successMessage,  translateText: true});
    this.dialogRef.close(object);
  }

}
