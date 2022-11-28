import {Component, Input, OnInit} from '@angular/core';
import {CaSpaceService} from '../../../../ca-core/service-api/ca-space.service';
import {
  CaSpaceInvit,
  CaSpaceInvitDatasource
} from '../../../../ca-core/model/entities/ca-space-invit.class';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {
  CaSpaceInvitFormDialogComponent,
  CaSpaceInvitFormDialogInput
} from '../ca-space-invit-form-dialog/ca-space-invit-form-dialog.component';
import {CaCurrentSpaceDetailComponent} from '../ca-current-space-detail/ca-current-space-detail.component';

/**
 * List the invitations of the space
 */
@Component({
  selector: 'ca-space-invit-list',
  templateUrl: './ca-space-invit-list.component.html',
  styleUrls: ['./ca-space-invit-list.component.scss']
})
export class CaSpaceInvitListComponent implements OnInit {

  @Input() spaceId: string;

  invitations: CaSpaceInvitDatasource;

  columns: FlTableColumn<CaSpaceInvit>[] = ['userMail', 'role', 'validUntil', 'sentThe', 'actions'];

  constructor(private spaceService: CaSpaceService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.invitations = this.spaceService.getInvitationsDatasource(this.spaceId);
  }

  openInvitationDialog(): void {
    const input: CaSpaceInvitFormDialogInput = {
      spaceId: this.spaceId
    };
    this.dialogService.openSmallDialog(CaSpaceInvitFormDialogComponent, {data: input}).afterClosed()
      .subscribe(
        invitation => this.onInvitationClosed(invitation)
      );
  }

  private onInvitationClosed(invitation?: CaSpaceInvit): void {
    if (invitation) {
      this.invitations.addItem(invitation);
    }
  }

}
