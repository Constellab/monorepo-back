import {Component, Inject, OnInit} from '@angular/core';
import {Study} from '../../../../../core/model/entities/study.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Validators} from '@angular/forms';
import {StudyService} from '../../../../service/study.service';
import {Observable} from 'rxjs';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';

export interface StudyFormDialogInput extends FlFormDialogInput<Study> {
  projectId?: string;
}

/**
 * Dialog form to create or update a study
 */
@Component({
  selector: 'gen-study-form-dialog',
  templateUrl: './study-form-dialog.component.html',
  styleUrls: ['./study-form-dialog.component.scss']
})
export class StudyFormDialogComponent extends FlFormDialogAbstractDirective<Partial<Study>, Study> implements OnInit {

  formGp: FormGroup<Partial<Study>>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: StudyFormDialogInput,
              private studyService: StudyService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<StudyFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'study_created', 'study_updated');
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<Study>> {
    return new FormBuilder().group({
      id: [null],
      title: [null, Validators.required],
      description: [null],
    });
  }

  create(formValue: Partial<Study>): Observable<Study> {
    return this.studyService.create(formValue, this.dialogInput.projectId);
  }

  update(formValue: Partial<Study>): Observable<Study> {
    return this.studyService.update(formValue);
  }


  get title(): string {
    return this.isCreateMode() ? 'new_study' : 'update_study';
  }


}
