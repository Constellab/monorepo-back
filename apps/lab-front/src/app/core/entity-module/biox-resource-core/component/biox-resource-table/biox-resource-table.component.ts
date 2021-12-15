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
import {FileResourceService} from '../../../../entity-service/file-resource.service';
import {RouterService} from '../../../../service/router.service';
import {BioxResourceService} from '../../../../entity-service/biox-resource.service';
import {BioxResource, BioxResourceDatasource} from '../../../../model/entities/resource/biox-resource.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {BioxTag} from '../../../../model/entities/biox-tag.entity';
import {BioxTagService} from '../../../../entity-service/biox-tag.service';
import {
  BioxImportResourceDialogComponent,
  BioxImportResourceDialogInput
} from '../biox-import-resource-dialog/biox-import-resource-dialog.component';

/**
 * Table to show resource with possibility actions on resource and a select mode
 */
@Component({
  selector: 'gen-biox-resource-table',
  templateUrl: './biox-resource-table.component.html',
  styleUrls: ['./biox-resource-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxResourceTableComponent extends FlTableAbstractDirective<BioxResource>
  implements OnInit {

  @Input() datasource: BioxResourceDatasource;

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() selectableRow: boolean = false;

  @Output() resourceSelected: EventEmitter<BioxResource> = new EventEmitter<BioxResource>();

  constructor(private fileService: FileResourceService,
              private resourceService: BioxResourceService,
              private dialogService: FlDialogService,
              private tagDialogService: FlTagDialogService,
              private tagService: BioxTagService,
              private cdr: ChangeDetectorRef) {
    super(['createdAt', 'action', 'name', 'info', 'tags']);
  }

  ngOnInit(): void {
  }

  downloadFile(resource: BioxResource): void {
    this.fileService.downloadFile(resource.id, resource.name).subscribe();
  }

  openImportResource(resource: BioxResource): void {
    const input: BioxImportResourceDialogInput = {
      resourceId: resource.id,
      resourceHumanName: resource.resourceTypeHumanName,
      resourceTypingName: resource.resourceTypingName
    };

    this.dialogService.openMediumDialog(BioxImportResourceDialogComponent, {data: input});
  }


  resourceRoute(resource: BioxResource): string {
    return RouterService.getBioxResourceDetailRoute(resource.id);
  }

  deleteResource(resource: BioxResource): void {
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

  private onDeleteResourceClosed(result: FlConfirmDialogResult<void>, resource: BioxResource): void {
    if (result.choice) {
      this.datasource.removeItem(resource);
    }
  }

  rowClicked(resource: BioxResource): void {
    if (this.selectableRow) {
      console.log(resource);
      this.resourceSelected.next(resource);
    }
  }

  openTagFormDialog(resource: BioxResource): void {
    this.tagDialogService.openUpdateTagDialog({
      tags: resource.tags,
      updateMethod: (tags) => this.tagService.saveTags(resource.typingName, resource.id, tags)
    }).afterClosed().subscribe(
      (newTags: BioxTag[]) => this.onTagClosed(resource, newTags)
    );
  }

  private onTagClosed(resource: BioxResource, newTags: BioxTag[]): void {
    if (newTags != null) {
      resource.tags = newTags;
      this.cdr.markForCheck();
    }
  }

  stopEventPropagation(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
  }

}
