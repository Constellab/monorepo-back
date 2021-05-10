import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {LabInstanceUser, LabInstanceUserForm} from '../../../core/model/entities/lab-instance.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {Validators} from '@angular/forms';
import {LabInstanceService} from '../../../core/service-api/lab-instance.service';

export interface LabInstanceUserFormDialogInput extends FlFormDialogInput<LabInstanceUserForm>{
  labInstanceId: string;
}

@Component({
  selector: 'gen-lab-instance-user-form-dialog',
  templateUrl: './lab-instance-user-form-dialog.component.html',
  styleUrls: ['./lab-instance-user-form-dialog.component.scss']
})
export class LabInstanceUserFormDialogComponent
  extends FlFormDialogAbstractDirective<LabInstanceUserForm, LabInstanceUser>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: LabInstanceUserFormDialogInput,
              private labInstanceService: LabInstanceService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<LabInstanceUserFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'lab_user_created', '');
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<LabInstanceUserForm> {
    return new FormBuilder().group({
      user: [null, Validators.required],
      group: [null, Validators.required],
    });
  }

  create(formValue: LabInstanceUserForm): Observable<LabInstanceUser> {
    return this.labInstanceService.addUserToLab(this.dialogInput.labInstanceId, formValue);
  }

  // not implemented
  update(): Observable<LabInstanceUser> {
    return undefined;
  }


}
