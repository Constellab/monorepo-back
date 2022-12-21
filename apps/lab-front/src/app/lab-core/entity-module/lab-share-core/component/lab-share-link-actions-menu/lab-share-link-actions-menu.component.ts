import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LabShareLink} from '../../../../model/entities/lab-share.entity';
import {LabShareLinkService} from '../../../../entity-service/lab-share-link.service';
import {
  FlClipboardService,
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {
  LabShareLinkFormDialogComponent,
  LabShareLinkFormDialogInput
} from '../lab-share-link-form-dialog/lab-share-link-form-dialog.component';
import {LabShareService} from '../../../../entity-service/lab-share.service';

/**
 * Action menu for a share link. To update, delete, copy the link or open entity
 */
@Component({
  selector: 'lab-share-link-actions-menu',
  templateUrl: './lab-share-link-actions-menu.component.html',
  styleUrls: ['./lab-share-link-actions-menu.component.scss']
})
export class LabShareLinkActionsMenuComponent implements OnInit {

  @Input() shareLink: LabShareLink;

  @Input() showLinkToEntity: boolean = false;

  @Output() update: EventEmitter<LabShareLink> = new EventEmitter();
  @Output() delete: EventEmitter<LabShareLink> = new EventEmitter();

  constructor(private shareLinkService: LabShareLinkService,
              private shareService: LabShareService,
              private dialogService: FlDialogService,
              private clipboard: FlClipboardService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
  }

  copyLinkToClipboard(): void {
    const result = this.clipboard.copy(this.shareService.getDownloadRoute(this.shareLink.entityType, this.shareLink.token));
    if (result) {
      this.snackBarService.openSuccessMessage({text: 'biox.share_link_copied', translateText: true});
    }
  }

  openUpdateDialog(): void {
    const input: LabShareLinkFormDialogInput = {
      mode: 'update',
      object: this.shareLink,
    };

    this.dialogService.openSmallDialog(LabShareLinkFormDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.onUpdateClosed(result)
    );
  }

  private onUpdateClosed(entity?: LabShareLink): void {
    if (entity) {
      this.update.emit(entity);
    }
  }

  deleteShareLink(): void {
    const input: FlConfirmDialogInput = {
      title: 'biox.delete_share_link',
      content: 'biox.delete_share_link_confirmation',
      translateTitleAndContent: true,
      observable: this.shareLinkService.delete(this.shareLink.id),
      successMessage: 'biox.share_link_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult): void {
    if (result.choice) {
      this.delete.emit(this.shareLink);
    }
  }

}
