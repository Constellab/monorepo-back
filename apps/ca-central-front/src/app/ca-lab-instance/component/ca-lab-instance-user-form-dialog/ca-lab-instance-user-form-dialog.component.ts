import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {Validators} from '@angular/forms';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {CaLabInstanceUser, CaLabInstanceUserRole} from '../../../ca-core/model/entities/ca-lab-instance-user.class';
import {CaUser} from '../../../ca-core/model/entities/ca-user.class';

export interface LabInstanceUserFormDialogInput extends FlFormDialogInput<CaLabInstanceUserForm> {
  labInstanceId: string;
}

interface CaLabInstanceUserForm {
  user: CaUser;
  role: CaLabInstanceUserRole;
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
      //in update mode can't change user
      user: [{value: null, disabled: this.isUpdateMode()}, Validators.required],
      role: ['USER', Validators.required],
    });
  }

  create(formValue: CaLabInstanceUserForm): Observable<CaLabInstanceUser> {
    return this.labInstanceService.addUserToLab(this.dialogInput.labInstanceId, formValue.user.id,
      formValue.role);
  }

  update(formValue: CaLabInstanceUserForm): Observable<CaLabInstanceUser> {
    return this.labInstanceService.updateUserLabRole(this.dialogInput.labInstanceId, formValue.user.id,
      formValue.role);
  }

  get title(): string {
    return this.isCreateMode() ? 'lab_user_create' : 'update_lab_user_role';
  }

  getCreateSuccessMessage(): string {
    return 'lab_user_created';
  }

  getUpdateSuccessMessage(): string {
    return 'lab_user_role_updated';
  }


}
