import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective,
  FlTagDialogService
} from '@monorepo/front-core-lib';
import {LabFileResourceService} from '../../../../entity-service/lab-file-resource.service';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {LabResource, LabResourceDatasource} from '../../../../model/entities/resource/lab-resource.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {LabTagService} from '../../../../entity-service/lab-tag.service';
import {
  LabImportResourceDialogComponent,
  LabImportResourceDialogInput
} from '../lab-import-resource-dialog/lab-import-resource-dialog.component';
import {LabUpdateResourceTypeComponent} from '../lab-update-resource-type/lab-update-resource-type.component';

/**
 * Table to show resource with possibility actions on resource and a select mode
 */
@Component({
  selector: 'lab-resource-table',
  templateUrl: './lab-resource-table.component.html',
  styleUrls: ['./lab-resource-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabResourceTableComponent extends FlTableAbstractDirective<LabResource>
  implements OnInit {

  @Input() datasource: LabResourceDatasource;

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() selectableRow: boolean = false;

  @Output() resourceSelected: EventEmitter<LabResource> = new EventEmitter<LabResource>();

  constructor(private fileService: LabFileResourceService,
              private resourceService: LabResourceService,
              private dialogService: FlDialogService,
              private tagDialogService: FlTagDialogService,
              private tagService: LabTagService,
              private cdr: ChangeDetectorRef) {
    super(['createdAt', 'action', 'name', 'info', 'tags']);
  }

  ngOnInit(): void {
  }

  downloadFile(resource: LabResource): void {
    this.fileService.downloadFile(resource.id, resource.name).subscribe();
  }

  openImportResource(resource: LabResource): void {
    const input: LabImportResourceDialogInput = {
      resourceId: resource.id,
      resourceHumanName: resource.resourceTypeHumanName,
      resourceTypingName: resource.resourceTypingName
    };

    this.dialogService.openMediumDialog(LabImportResourceDialogComponent, {data: input});
  }

  deleteResource(resource: LabResource): void {
    const input: FlConfirmDialogInput = {
      title: 'databox.delete_resource',
      content: 'databox.delete_resource_confirmation',
      translateTitleAndContent: true,
      observable: this.resourceService.delete(resource.id),
      successMessage: 'databox.resource_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteResourceClosed(result, resource)
    );
  }

  private onDeleteResourceClosed(result: FlConfirmDialogResult<void>, resource: LabResource): void {
    if (result.choice) {
      this.datasource.removeItem(resource);
    }
  }

  rowClicked(resource: LabResource): void {
    if (this.selectableRow) {
      this.resourceSelected.next(resource);
    }
  }

  openTagFormDialog(resource: LabResource): void {
    this.tagDialogService.openUpdateTagDialog({
      tags: resource.tags,
      updateMethod: (tags) => this.tagService.saveTags(resource.typingName, resource.id, tags)
    }).afterClosed().subscribe(
      (newTags: LabTag[]) => this.onTagClosed(resource, newTags)
    );
  }

  private onTagClosed(resource: LabResource, newTags: LabTag[]): void {
    if (newTags != null) {
      resource.tags = newTags;
      this.cdr.markForCheck();
    }
  }

  stopEventPropagation(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
  }

  updateResourceType(resource: LabResource): void {
    this.dialogService.openSmallDialog(LabUpdateResourceTypeComponent, {data: resource}).afterClosed().subscribe(
      updatedResource => this.onUpdateResourceClosed(updatedResource)
    );
  }

  private onUpdateResourceClosed(resource?: LabResource): void {
    if (resource) {
      this.datasource.updateItem(resource);
    }
  }
}
