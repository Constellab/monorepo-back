import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaSpaceInvitService} from '../../../../ca-core/service-api/ca-space-invit.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CaSpaceInvit, CaSpaceInvitDTO} from '../../../../ca-core/model/entities/ca-space-invit.class';
import {Validators} from '@angular/forms';
import {CaSpaceRole, CaSpaceType} from '../../../../ca-core/model/entities/ca-space.class';

export interface CaSpaceInvitFormDialogInput {
  spaceId: string;
  spaceType: CaSpaceType;
}

/**
 * Dialog to create a space invitation
 */
@Component({
  selector: 'ca-space-invit-form-dialog',
  templateUrl: './ca-space-invit-form-dialog.component.html',
  styleUrls: ['./ca-space-invit-form-dialog.component.scss']
})
export class CaSpaceInvitFormDialogComponent implements OnInit {

  formGp: FormGroup<CaSpaceInvitDTO>;

  availableRoles = CaSpaceRole;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaSpaceInvitFormDialogInput,
              private dialogRef: MatDialogRef<CaSpaceInvitFormDialogComponent>,
              private spaceInvitService: CaSpaceInvitService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formGp = new FormBuilder().group({
      userMail: [null, [Validators.required, Validators.email]],
      role: [CaSpaceRole.USER, Validators.required]
    });
  }

  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      this.createInvitation(this.formGp.value);
    }
  }

  private createInvitation(invitationDto: CaSpaceInvitDTO): void {
    this.isLoading = true;
    this.spaceInvitService.createInvitation(this.input.spaceId, invitationDto).subscribe({
      next: invitation => this.createSuccess(invitation),
      error: () => this.isLoading = false
    });

  }

  private createSuccess(invitation: CaSpaceInvit): void {
    this.snackBarService.openSuccessMessage({text: 'invitation_created', translateText: true});
    this.dialogRef.close(invitation);
    this.isLoading = false;
  }

  /**
   * Show a warning when the user tries to share his personal space
   */
  get showSharePersonalWarning(): boolean {
    return this.input.spaceType === 'PERSONAL';
  }
}
