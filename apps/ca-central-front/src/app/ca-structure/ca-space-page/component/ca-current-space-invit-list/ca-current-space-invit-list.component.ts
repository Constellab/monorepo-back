import {Component, OnInit} from '@angular/core';
import {CaSpaceService} from '../../../../ca-core/service-api/ca-space.service';
import {CaSpaceInvit, CaSpaceInvitDatasource} from '../../../../ca-core/model/entities/space/ca-space-invit.class';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {
  CaSpaceInvitFormDialogComponent,
  CaSpaceInvitFormDialogInput
} from '../ca-space-invit-form-dialog/ca-space-invit-form-dialog.component';
import {CaCurrentSpaceService} from '../../../../ca-core/service-api/ca-current-space.service';

/**
 * List the invitations of the space
 */
@Component({
  selector: 'ca-current-space-invit-list',
  templateUrl: './ca-current-space-invit-list.component.html',
  styleUrls: ['./ca-current-space-invit-list.component.scss']
})
export class CaCurrentSpaceInvitListComponent implements OnInit {

  invitations: CaSpaceInvitDatasource;

  columns: FlTableColumn<CaSpaceInvit>[] = ['userMail', 'role', 'validUntil', 'sentThe', 'actions'];

  constructor(private spaceService: CaSpaceService,
              private dialogService: FlDialogService,
              private currentSpaceService: CaCurrentSpaceService) {
  }

  ngOnInit(): void {
    this.invitations = this.spaceService.getInvitationsDatasource('current');
  }

  async openInvitationDialog(): Promise<void> {
    const space = await this.currentSpaceService.getCurrentSpacePromise()
    const input: CaSpaceInvitFormDialogInput = {
      spaceId: space.id,
      spaceType: space.type
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
