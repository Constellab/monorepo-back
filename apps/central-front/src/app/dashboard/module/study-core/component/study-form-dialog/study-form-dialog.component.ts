import {Component, Inject, OnInit} from '@angular/core';
import {FormDialogInput} from '../../../../../core/model/global/form.class';
import {Study} from '../../../../../core/model/entities/study.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SnackBarService} from '../../../../../core/service/snack-bar.service';
import {Validators} from '@angular/forms';
import {StudyService} from '../../../../service/study.service';
import {FormDialogAbstractDirective} from '../../../../../core/abstract-directive/form-dialog-abstract.directive';
import {Observable} from 'rxjs';

export interface StudyFormDialogInput extends FormDialogInput<Study> {
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
export class StudyFormDialogComponent extends FormDialogAbstractDirective<Partial<Study>, Study> implements OnInit {

  formGp: FormGroup<Partial<Study>>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: StudyFormDialogInput,
              private studyService: StudyService,
              snackBarService: SnackBarService,
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
