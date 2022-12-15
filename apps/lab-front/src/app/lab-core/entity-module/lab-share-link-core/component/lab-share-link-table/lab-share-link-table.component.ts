import {Component, Input, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {LabShareLink, LabShareLinkDatasource} from '../../../../model/entities/lab-share-link.entity';
import {
  LabShareLinkFormDialogComponent,
  LabShareLinkFormDialogInput
} from '../lab-share-link-form-dialog/lab-share-link-form-dialog.component';
import {LabShareLinkService} from '../../../../entity-service/lab-share-link.service';

@Component({
  selector: 'lab-share-link-table',
  templateUrl: './lab-share-link-table.component.html',
  styleUrls: ['./lab-share-link-table.component.scss']
})
export class LabShareLinkTableComponent extends FlTableAbstractDirective<LabShareLink>
  implements OnInit {

  @Input() datasource: LabShareLinkDatasource;

  constructor(private dialogService: FlDialogService,
              private shareLinkService: LabShareLinkService) {
    super(['entityType', 'entityName', 'validUntil', 'downloadLink', 'actions']);
  }

  ngOnInit(): void {
  }

  openUpdateDialog(entity: LabShareLink): void {
    const input: LabShareLinkFormDialogInput = {
      mode: 'update',
      object: entity,
    };

    this.dialogService.openSmallDialog(LabShareLinkFormDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.onUpdateClosed(result)
    );
  }

  private onUpdateClosed(entity?: LabShareLink): void {
    if (entity) {
      this.datasource.updateItem(entity);
    }
  }

  deleteShareLink(entity: LabShareLink): void {
    const input: FlConfirmDialogInput = {
      title: 'biox.delete_share_link',
      content: 'biox.delete_share_link_confirmation',
      translateTitleAndContent: true,
      observable: this.shareLinkService.delete(entity.id),
      successMessage: 'biox.share_link_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, entity)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult, entity: LabShareLink): void {
    if (result.choice) {
      this.datasource.removeItem(entity);
    }
  }

  getDownloadLink(entity: LabShareLink): string {
    return this.shareLinkService.getDownloadRoute(entity.entityType, entity.token);
  }


}
