import {Component, Inject, OnInit} from '@angular/core';
import {FormDialogAbstractDirective} from '../../../../abstract-directive/form-dialog-abstract.directive';
import {Lab} from '../../../../model/entities/lab.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormDialogInput} from '../../../../model/global/form.class';
import {SnackBarService} from '../../../../service/snack-bar.service';
import {LabService} from '../../../../../dashboard/service/lab.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';

@Component({
  selector: 'gen-lab-form-dialog',
  templateUrl: './lab-form-dialog.component.html',
  styleUrls: ['./lab-form-dialog.component.scss']
})
export class LabFormDialogComponent extends FormDialogAbstractDirective<Partial<Lab>, Lab> implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: FormDialogInput<Lab>,
              private labService: LabService,
              snackBarService: SnackBarService,
              dialogRef: MatDialogRef<LabFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'lab_created', 'lab_updated');
  }

  ngOnInit(): void {
    this.init();
  }

  get title(): string {
    return this.isCreateMode() ? 'create_lab_instance' : 'update_lab_instance';
  }


  buildForm(): FormGroup<Partial<Lab>> {
    return new FormBuilder().group({
      id: [null],
      label: [null, Validators.required],
    });
  }

  create(formValue: Partial<Lab>): Observable<Lab> {
    return this.labService.create(formValue);
  }

  update(formValue: Partial<Lab>): Observable<Lab> {
    return this.labService.update(formValue);
  }

}
