import {Component, Input, OnInit} from '@angular/core';
import {CaSpaceInvitService} from '../../../../ca-core/service-api/ca-space-invit.service';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDatasourcePaginated,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {CaSpaceRole} from '../../../../ca-core/model/entities/ca-space.class';
import {
  CaSpaceUserRoleDialogComponent,
  CaSpaceUserRoleDialogInput
} from '../ca-space-user-role-dialog/ca-space-user-role-dialog.component';
import {CaSpaceInvit} from '../../../../ca-core/model/entities/ca-space-invit.class';
import {CaCurrentSpaceDetailComponent} from '../ca-current-space-detail/ca-current-space-detail.component';

/**
 * Table for the SpaceInvit entity with actions
 */
@Component({
  selector: 'ca-space-invit-table',
  templateUrl: './ca-space-invit-table.component.html',
  styleUrls: ['./ca-space-invit-table.component.scss']
})
export class CaSpaceInvitTableComponent extends FlTableAbstractDirective<CaSpaceInvit>
  implements OnInit {

  @Input() datasource: FlDatasourcePaginated<CaSpaceInvit>;

  constructor(private spaceInvitService: CaSpaceInvitService,
              private dialogService: FlDialogService) {
    super(['userMail', 'role', 'validUntil', 'sentThe', 'actions']);
  }

  ngOnInit(): void {
  }


  openUpdateRoleDialog(invitation: CaSpaceInvit): void {
    const data: CaSpaceUserRoleDialogInput = {
      currentRole: invitation.role,
      updateRole: (role) =>
        this.spaceInvitService.updateInvitationRole(invitation.id, role)
    };

    this.dialogService.openSmallDialog(CaSpaceUserRoleDialogComponent, {data}).afterClosed().subscribe(
      role => this.onUpdateRoleClosed(invitation, role)
    );

  }

  private onUpdateRoleClosed(invitation: CaSpaceInvit, role?: CaSpaceRole): void {
    if (role) {
      invitation.role = role;
    }
  }

  openResendInvitationDialog(invitation: CaSpaceInvit): void {
    const input: FlConfirmDialogInput = {
      title: 'resend_invitation',
      content: 'resend_invitation_confirmation',
      translateTitleAndContent: true,
      observable: this.spaceInvitService.resendInvitation(invitation.id),
      successMessage: 'invitation_resent',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input);
  }

  openRefreshInvitationDialog(invitation: CaSpaceInvit): void {
    const input: FlConfirmDialogInput = {
      title: 'refresh_invitation_expiration',
      content: 'refresh_invitation_expiration_confirmation',
      translateTitleAndContent: true,
      observable: this.spaceInvitService.refreshInvitationValidUntil(invitation.id),
      successMessage: 'invitation_expiration_refreshed',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onRefreshClosed(result)
    );
  }

  private onRefreshClosed(result: FlConfirmDialogResult<CaSpaceInvit>): void {
    if (result.choice) {
      this.datasource.updateItem(result.result);
    }
  }

  openDeleteInvitationDialog(invitation: CaSpaceInvit): void {
    const input: FlConfirmDialogInput = {
      title: 'delete_invitation',
      content: 'delete_invitation_confirmation',
      translateTitleAndContent: true,
      observable: this.spaceInvitService.deleteInvitation(invitation.id),
      successMessage: 'invitation_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, invitation)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult<void>, invitation: CaSpaceInvit): void {
    if (result.choice) {
      this.datasource.removeItem(invitation);
    }
  }
}
