import {Component, Input, OnInit} from '@angular/core';
import {CaOrganizationInvitService} from '../../../../ca-core/service-api/ca-organization-invit.service';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDatasourcePaginated,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {CaOrganizationRole} from '../../../../ca-core/model/entities/ca-organization.class';
import {
  CaOrganisationUserRoleDialogComponent,
  CaOrganisationUserRoleDialogInput
} from '../ca-organisation-user-role-dialog/ca-organisation-user-role-dialog.component';
import {CaOrganizationInvit} from '../../../../ca-core/model/entities/ca-organization-invit.class';

/**
 * Table for the OrganizationInvit entity with actions
 */
@Component({
  selector: 'ca-organization-invit-table',
  templateUrl: './ca-organization-invit-table.component.html',
  styleUrls: ['./ca-organization-invit-table.component.scss']
})
export class CaOrganizationInvitTableComponent extends FlTableAbstractDirective<CaOrganizationInvit>
  implements OnInit {

  @Input() datasource: FlDatasourcePaginated<CaOrganizationInvit>;

  constructor(private organizationInvitService: CaOrganizationInvitService,
              private dialogService: FlDialogService) {
    super(['userMail', 'role', 'validUntil', 'sentThe', 'actions']);
  }

  ngOnInit(): void {
  }


  openUpdateRoleDialog(invitation: CaOrganizationInvit): void {
    const data: CaOrganisationUserRoleDialogInput = {
      currentRole: invitation.role,
      updateRole: (role) =>
        this.organizationInvitService.updateInvitationRole(invitation.id, role)
    };

    this.dialogService.openSmallDialog(CaOrganisationUserRoleDialogComponent, {data}).afterClosed().subscribe(
      role => this.onUpdateRoleClosed(invitation, role)
    );

  }

  private onUpdateRoleClosed(invitation: CaOrganizationInvit, role?: CaOrganizationRole): void {
    if (role) {
      invitation.role = role;
    }
  }

  openResendInvitationDialog(invitation: CaOrganizationInvit): void {
    const input: FlConfirmDialogInput = {
      title: 'resend_invitation',
      content: 'resend_invitation_confirmation',
      translateTitleAndContent: true,
      observable: this.organizationInvitService.resendInvitation(invitation.id),
      successMessage: 'invitation_resent',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input);
  }

  openRefreshInvitationDialog(invitation: CaOrganizationInvit): void {
    const input: FlConfirmDialogInput = {
      title: 'refresh_invitation_expiration',
      content: 'refresh_invitation_expiration_confirmation',
      translateTitleAndContent: true,
      observable: this.organizationInvitService.refreshInvitationValidUntil(invitation.id),
      successMessage: 'invitation_expiration_refreshed',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onRefreshClosed(result)
    );
  }

  private onRefreshClosed(result: FlConfirmDialogResult<CaOrganizationInvit>): void {
    if (result.choice) {
      this.datasource.updateItem(result.result);
    }
  }

  openDeleteInvitationDialog(invitation: CaOrganizationInvit): void {
    const input: FlConfirmDialogInput = {
      title: 'delete_invitation',
      content: 'delete_invitation_confirmation',
      translateTitleAndContent: true,
      observable: this.organizationInvitService.deleteInvitation(invitation.id),
      successMessage: 'invitation_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, invitation)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult<void>, invitation: CaOrganizationInvit): void {
    if (result.choice) {
      this.datasource.removeItem(invitation);
    }
  }
}
