import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaOrganizationInvitService} from '../../../../ca-core/service-api/ca-organization-invit.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {
  CaOrganizationInvit,
  CaOrganizationInvitDTO
} from '../../../../ca-core/model/entities/ca-organization-invit.class';
import {Validators} from '@angular/forms';
import {CaOrganizationRole} from '../../../../ca-core/model/entities/ca-organization.class';

export interface CaOrganizationInvitFormDialogInput {
  organizationId: string;
}

/**
 * Dialog to create an organization invitation
 */
@Component({
  selector: 'ca-organization-invit-form-dialog',
  templateUrl: './ca-organization-invit-form-dialog.component.html',
  styleUrls: ['./ca-organization-invit-form-dialog.component.scss']
})
export class CaOrganizationInvitFormDialogComponent implements OnInit {

  formGp: FormGroup<CaOrganizationInvitDTO>;

  availableRoles = CaOrganizationRole;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaOrganizationInvitFormDialogInput,
              private dialogRef: MatDialogRef<CaOrganizationInvitFormDialogComponent>,
              private organizationInvitService: CaOrganizationInvitService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formGp = new FormBuilder().group({
      userMail: [null, [Validators.required, Validators.email]],
      role: [CaOrganizationRole.USER, Validators.required]
    });
  }

  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      this.createInvitation(this.formGp.value);
    }
  }

  private createInvitation(invitationDto: CaOrganizationInvitDTO): void {
    this.isLoading = true;
    this.organizationInvitService.createInvitation(this.input.organizationId, invitationDto).subscribe({
      next: invitation => this.createSuccess(invitation),
      error: () => this.isLoading = false
    });

  }

  private createSuccess(invitation: CaOrganizationInvit): void {
    this.snackBarService.openSuccessMessage({text: 'invitation_created', translateText: true});
    this.dialogRef.close(invitation);
    this.isLoading = false;
  }
}
