import {Component, Inject, OnInit} from '@angular/core';
import {FormControl} from '@ngneat/reactive-forms';
import {CaUser} from '../../../../ca-core/model/entities/ca-user.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaOrganizationService} from '../../../../ca-core/service-api/ca-organization.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {Validators} from '@angular/forms';

@Component({
  selector: 'ca-organization-add-user-dialog',
  templateUrl: './ca-organization-add-user-dialog.component.html',
  styleUrls: ['./ca-organization-add-user-dialog.component.scss']
})
export class CaOrganizationAddUserDialogComponent implements OnInit {

  formControl: FormControl<CaUser>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private orgaId: string,
              private dialogRef: MatDialogRef<CaOrganizationAddUserDialogComponent>,
              private organizationService: CaOrganizationService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formControl = new FormControl<CaUser>(null, Validators.required);
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.addUserToOrganization(this.formControl.value.id);
    }
  }

  private addUserToOrganization(userId: string): void {
    this.isLoading = true;
    this.organizationService.addUserToOrganization(this.orgaId, userId).subscribe({
      next: user => this.addUserSuccess(user),
      error: () => this.isLoading = false
    });
  }

  private addUserSuccess(user: CaUser): void {
    this.snackBarService.openSuccessMessage({text: 'organization_user_added', translateText: true});
    this.isLoading = false;
    this.dialogRef.close(user);
  }

}
