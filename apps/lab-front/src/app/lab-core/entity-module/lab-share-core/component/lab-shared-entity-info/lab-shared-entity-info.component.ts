import {Component, Input, OnInit} from '@angular/core';
import {
  LabSharedEntity,
  LabSharedEntityDatasource,
  LabShareLink,
  LabShareLinkType
} from '../../../../model/entities/lab-share.entity';
import {LabShareService} from '../../../../entity-service/lab-share.service';
import {FlClipboardService, FlDialogService, FlSnackBarService, FlTableColumn} from '@monorepo/front-core-lib';
import {
  LabShareLinkFormDialogComponent,
  LabShareLinkFormDialogInput
} from '../lab-share-link-form-dialog/lab-share-link-form-dialog.component';
import {Observable, of, share} from 'rxjs';
import {LabShareLinkService} from '../../../../entity-service/lab-share-link.service';

/**
 * Card that show the share link with possibility to CRUD it and list
 * the SharedEntity (info on where this entity was shared)
 */
@Component({
  selector: 'lab-shared-entity-info',
  templateUrl: './lab-shared-entity-info.component.html',
  styleUrls: ['./lab-shared-entity-info.component.scss']
})
export class LabSharedEntityInfoComponent implements OnInit {

  @Input() entityType: LabShareLinkType;

  @Input() entityId: string;

  shareLink$: Observable<LabShareLink>;

  sharedEntities: LabSharedEntityDatasource;

  displayedColumns: FlTableColumn<LabSharedEntity>[] = ['lab', 'space', 'receiver', 'sharedBy'];

  constructor(private shareService: LabShareService,
              private shareLinkService: LabShareLinkService,
              private dialogService: FlDialogService,
              private clipboardService: FlClipboardService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.shareLink$ = this.shareLink$ = this.shareLinkService.getShareLink(this.entityType, this.entityId).pipe(share());
    this.sharedEntities = this.shareService.getSharedToDatasource(this.entityType, this.entityId);
  }

  private getShareDialogTitle(): string {
    switch (this.entityType) {
      case 'RESOURCE':
        return 'biox.share_resource';
      default:
        throw new Error('Unknown entity type');
    }
  }

  get shareButtonText(): string {
    switch (this.entityType) {
      case 'RESOURCE':
        return 'biox.share_resource';
      default:
        throw new Error('Unknown entity type');
    }
  }

  openShareDialog(): void {
    const data: LabShareLinkFormDialogInput = {
      mode: 'create',
      entityType: this.entityType,
      entityId: this.entityId,
      createTitle: this.getShareDialogTitle()
    };

    this.dialogService.openSmallDialog(LabShareLinkFormDialogComponent, {data: data}).afterClosed().subscribe(
      (shareLink: LabShareLink) => this.onShareClosedClosed(shareLink)
    );
  }

  private onShareClosedClosed(shareLink?: LabShareLink): void {
    if (shareLink) {
      this.onShareLinkUpdate(shareLink);
    }
  }

  onShareLinkUpdate(entity: LabShareLink): void {
    this.shareLink$ = of(entity);
  }

  onShareLinkDelete(): void {
    this.shareLink$ = of(null);
  }

  getDownloadLink(shareLink: LabShareLink): string {
    if (shareLink) {
      return this.shareLinkService.getDownloadLink(shareLink.entityType, shareLink.token);
    }
    return null;
  }

  copyDownloadLink(shareLink: LabShareLink): void {
    const result = this.clipboardService.copy(this.shareService.getDownloadRoute(shareLink.entityType, shareLink.token));
    if (result) {
      this.snackBarService.openSuccessMessage({text: 'biox.share_link_copied', translateText: true});
    }
  }

}
