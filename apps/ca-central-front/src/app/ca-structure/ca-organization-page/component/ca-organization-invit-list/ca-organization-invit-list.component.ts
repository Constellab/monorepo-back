import {Component, Input, OnInit} from '@angular/core';
import {CaOrganizationService} from '../../../../ca-core/service-api/ca-organization.service';
import {
  CaOrganizationInvit,
  CaOrganizationInvitDatasource
} from '../../../../ca-core/model/entities/ca-organization-invit.class';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {
  CaOrganizationInvitFormDialogComponent,
  CaOrganizationInvitFormDialogInput
} from '../ca-organization-invit-form-dialog/ca-organization-invit-form-dialog.component';

/**
 * List the invitations of the organization
 */
@Component({
  selector: 'ca-organization-invit-list',
  templateUrl: './ca-organization-invit-list.component.html',
  styleUrls: ['./ca-organization-invit-list.component.scss']
})
export class CaOrganizationInvitListComponent implements OnInit {

  @Input() organizationId: string;

  invitations: CaOrganizationInvitDatasource;

  columns: FlTableColumn<CaOrganizationInvit>[] = ['userMail', 'role', 'validUntil', 'sentThe', 'actions'];

  constructor(private organizationService: CaOrganizationService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.invitations = this.organizationService.getInvitationsDatasource(this.organizationId);
  }

  openInvitationDialog(): void {
    const input: CaOrganizationInvitFormDialogInput = {
      organizationId: this.organizationId
    };
    this.dialogService.openSmallDialog(CaOrganizationInvitFormDialogComponent, {data: input}).afterClosed()
      .subscribe(
        invitation => this.onInvitationClosed(invitation)
      );
  }

  private onInvitationClosed(invitation?: CaOrganizationInvit): void {
    if (invitation) {
      this.invitations.addItem(invitation);
    }
  }

}
