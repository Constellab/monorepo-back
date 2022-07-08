import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {
  LabImportResourceDialogComponent,
  LabImportResourceDialogInput
} from '../lab-import-resource-dialog/lab-import-resource-dialog.component';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTagDialogService,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {LabUpdateResourceTypeComponent} from '../lab-update-resource-type/lab-update-resource-type.component';
import {
  LabUpdateResourceNameDialogComponent
} from '../lab-update-resource-name-dialog/lab-update-resource-name-dialog.component';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {LabResourceDownloadService} from '../../../../entity-service/lab-resource-download.service';
import {
  LabTypeDialogComponent,
  LabTypeDialogInput
} from '../../../lab-type-core/component/lab-type-dialog/lab-type-dialog.component';

/**
 * Action menu button for resources, it has an ng-content for custom buttons
 */
@Component({
  selector: 'lab-resource-actions-menu',
  templateUrl: './lab-resource-actions-menu.component.html',
  styleUrls: ['./lab-resource-actions-menu.component.scss']
})
export class LabResourceActionsMenuComponent implements OnInit {

  @Input() resource: LabResource;

  @Input() readOnly: boolean = false;

  @Output() update: EventEmitter<LabResource> = new EventEmitter<LabResource>();
  @Output() updateTags: EventEmitter<LabTag[]> = new EventEmitter<LabTag[]>();
  @Output() delete: EventEmitter<LabResource> = new EventEmitter<LabResource>();

  constructor(private resourceService: LabResourceService,
              private dialogService: FlDialogService,
              private tagDialogService: FlTagDialogService,
              private resourceDownloadService: LabResourceDownloadService,
              private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
  }

  downloadResource(): void {
    this.resourceDownloadService.downloadResource(this.resource);
  }

  openImportResource(): void {
    const input: LabImportResourceDialogInput = {
      resourceId: this.resource.id,
      resourceHumanName: this.resource.resourceTypeHumanName,
      resourceTypingName: this.resource.resourceTypingName,
      nodeExtension: this.resource.fsNode.getExtension()
    };

    this.dialogService.openMediumDialog(LabImportResourceDialogComponent, {data: input});
  }


  openTagFormDialog(): void {
    this.tagDialogService.openUpdateTagDialog({
      tags: this.resource.tags,
      updateMethod: (tags) => this.resourceService.saveTags(this.resource.id, tags)
    }).afterClosed().subscribe(
      (newTags: LabTag[]) => this.onTagClosed(newTags)
    );
  }

  private onTagClosed(newTags: LabTag[]): void {
    if (newTags != null) {
      this.updateTags.next(newTags);
    }
  }

  updateResourceType(): void {
    this.dialogService.openSmallDialog(LabUpdateResourceTypeComponent, {data: this.resource}).afterClosed().subscribe(
      updatedResource => this.onUpdateResourceClosed(updatedResource)
    );
  }

  openUpdateName(): void {
    this.dialogService.openSmallDialog(LabUpdateResourceNameDialogComponent, {data: this.resource}).afterClosed().subscribe(
      updatedResource => this.onUpdateResourceClosed(updatedResource)
    );
  }

  private onUpdateResourceClosed(resource?: LabResource): void {
    if (resource) {
      this.update.next(resource);
    }
  }

  deleteResource(): void {
    // build the confirmation message
    let confirmation = `<p>${this.translateService.translate('databox.delete_resource_confirmation')}</p>`;
    // for imported or transformed resources, we add an info message
    if (this.resource.origin === 'IMPORTED') {
      confirmation += `<p>${this.translateService.translate('databox.delete_imported_resource_confirmation')}</p>`;
    } else if (this.resource.origin === 'TRANSFORMED') {
      confirmation += `<p>${this.translateService.translate('databox.delete_transformed_resource_confirmation')}</p>`;
    }

    const input: FlConfirmDialogInput = {
      title: this.translateService.translate('databox.delete_resource'),
      content: confirmation,
      translateTitleAndContent: false,
      observable: this.resourceService.delete(this.resource.id),
      successMessage: 'databox.resource_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteResourceClosed(result)
    );
  }

  private onDeleteResourceClosed(result: FlConfirmDialogResult<void>): void {
    if (result.choice) {
      this.delete.next(this.resource);
    }
  }

  openTypingDoc(): void{
    const data: LabTypeDialogInput = {
      typingName: this.resource.resourceTypingName
    }
    this.dialogService.openMediumDialog(LabTypeDialogComponent, {data: data});
  }


}
