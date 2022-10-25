import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaOrganizationRole} from '../../../../ca-core/model/entities/ca-organization.class';
import {CaOrganizationService} from '../../../../ca-core/service-api/ca-organization.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {FormControl, Validators} from '@angular/forms';
import {Observable} from 'rxjs';

export interface CaOrganisationUserRoleDialogInput {
  currentRole: CaOrganizationRole;
  updateRole: (role: CaOrganizationRole) => Observable<any>;
}


/**
 * Dialog to update the role of a user in an organization
 */
@Component({
  selector: 'ca-organisation-user-role-dialog',
  templateUrl: './ca-organisation-user-role-dialog.component.html',
  styleUrls: ['./ca-organisation-user-role-dialog.component.scss']
})
export class CaOrganisationUserRoleDialogComponent implements OnInit {

  formControl: FormControl;

  availableRoles = CaOrganizationRole;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaOrganisationUserRoleDialogInput,
              private dialogRef: MatDialogRef<CaOrganisationUserRoleDialogComponent>,
              private organizationService: CaOrganizationService,
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

  private updateRole(role: CaOrganizationRole): void {
    this.isLoading = true;
    this.input.updateRole(role).subscribe({
      next: () => this.updateRoleSuccess(role),
      error: () => this.isLoading = false
    });

  }

  private updateRoleSuccess(role: CaOrganizationRole): void {
    this.snackBarService.openSuccessMessage({text: 'organization_role_updated', translateText: true});
    this.dialogRef.close(role);
  }
}
