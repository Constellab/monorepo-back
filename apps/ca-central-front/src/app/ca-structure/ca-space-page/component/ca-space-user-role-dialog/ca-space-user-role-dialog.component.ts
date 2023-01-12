import {Component, Inject, OnInit} from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';
import {CaSpaceService} from '../../../../ca-core/service-api/ca-space.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {FormControl, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {CaSpaceRole} from '../../../../ca-core/model/entities/space/ca-space-user.class';

export interface CaSpaceUserRoleDialogInput {
  currentRole: CaSpaceRole;
  updateRole: (role: CaSpaceRole) => Observable<any>;
}


/**
 * Dialog to update the role of a user in an space
 */
@Component({
  selector: 'ca-space-user-role-dialog',
  templateUrl: './ca-space-user-role-dialog.component.html',
  styleUrls: ['./ca-space-user-role-dialog.component.scss']
})
export class CaSpaceUserRoleDialogComponent implements OnInit {

  formControl: FormControl;

  availableRoles = CaSpaceRole;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaSpaceUserRoleDialogInput,
              private dialogRef: MatDialogRef<CaSpaceUserRoleDialogComponent>,
              private spaceService: CaSpaceService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formControl = new FormControl<any>(this.input.currentRole, [Validators.required]);
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.updateRole(this.formControl.value);
    }
  }

  private updateRole(role: CaSpaceRole): void {
    this.isLoading = true;
    this.input.updateRole(role).subscribe({
      next: () => this.updateRoleSuccess(role),
      error: () => this.isLoading = false
    });

  }

  private updateRoleSuccess(role: CaSpaceRole): void {
    this.snackBarService.openSuccessMessage({text: 'space_role_updated', translateText: true});
    this.dialogRef.close(role);
  }
}
