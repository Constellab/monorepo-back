import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {CaLabInstanceUser, CaLabInstanceUserForm} from '../../../ca-core/model/entities/ca-lab-instance.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {Validators} from '@angular/forms';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';

export interface LabInstanceUserFormDialogInput extends FlFormDialogInput<CaLabInstanceUserForm>{
  labInstanceId: string;
}

@Component({
  selector: 'ca-lab-instance-user-form-dialog',
  templateUrl: './ca-lab-instance-user-form-dialog.component.html',
  styleUrls: ['./ca-lab-instance-user-form-dialog.component.scss']
})
export class CaLabInstanceUserFormDialogComponent
  extends FlFormDialogAbstractDirective<CaLabInstanceUserForm, CaLabInstanceUser>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: LabInstanceUserFormDialogInput,
              private labInstanceService: CaLabInstanceService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaLabInstanceUserFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<CaLabInstanceUserForm> {
    return new FormBuilder().group({
      user: [null, Validators.required],
      group: [null, Validators.required],
    });
  }

  create(formValue: CaLabInstanceUserForm): Observable<CaLabInstanceUser> {
    return this.labInstanceService.addUserToLab(this.dialogInput.labInstanceId, formValue);
  }

  // not implemented
  update(): Observable<CaLabInstanceUser> {
    return undefined;
  }

  getCreateSuccessMessage(): string {
    return 'lab_user_created';
  }

  getUpdateSuccessMessage(): string {
    return '';
  }



}
