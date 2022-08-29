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
  FlArrayObs,
  FlArrayObsStatus,
  FlDialogService,
  FlDropEvent,
  FlEntityArrayObs,
  FlTableAbstractDirective,
  FlTag,
  FlTagSelectedEvent
} from '@monorepo/front-core-lib';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {LabDragType} from '../../../../model/global/lab-drag-type.class';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {LabResourceDetailDialogComponent} from '../lab-resource-detail-dialog/lab-resource-detail-dialog.component';
import {Observable} from 'rxjs';

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

  @Input() datasource: FlArrayObs<LabResource>;

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() selectableRow: boolean = false;

  @Input() tagSelectable: boolean = true;

  @Output() resourceSelected: EventEmitter<LabResource> = new EventEmitter();

  @Output() tagSelected: EventEmitter<FlTag> = new EventEmitter();

  // enable drop tags
  supportedDropType: LabDragType = LabDragType.TAG;

  // for parent resource only, store the current expanded resource
  expandedResource: LabResource;
  // store the children resources of the current expanded resource
  expandedChildrenResources$: FlEntityArrayObs<LabResource>;
  expandedChildrenStatus$: Observable<FlArrayObsStatus>;

  constructor(private cdr: ChangeDetectorRef,
              private resourceService: LabResourceService,
              private dialogService: FlDialogService) {
    super(['created', 'action', 'name', 'info', 'tags', 'viewResource', 'openInNewTab',
      'expandedDetail', 'preview', 'flagged']);
  }

  ngOnInit(): void {
  }

  rowClicked(resource: LabResource): void {
    if (this.selectableRow) {
      this.emitResourceSelected(resource);
    }
  }

  emitResourceSelected(resource: LabResource): void {
    this.resourceSelected.next(resource);
  }


  stopEventPropagation(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
  }

  onUpdate(resource: LabResource): void {
    this.datasource.updateItem(resource);
  }


  onUpdateTags(resource: LabResource, newTags: LabTag[]): void {
    if (newTags != null) {
      resource.tags = newTags;
      this.cdr.markForCheck();
    }
  }

  onDelete(resource: LabResource): void {
    this.datasource.removeItem(resource);
  }

  onTagSelected(tagEvent: FlTagSelectedEvent): void {
    ClHelpService.stopEventPropagation(tagEvent.event);
    this.emitTagSelected(tagEvent.tag);
  }

  emitTagSelected(tag: LabTag): void {
    this.tagSelected.next(tag);
  }


  onDrop(resource: LabResource, event: FlDropEvent<FlTag>): void {
    if (!event.data) return;

    resource.addTag(event.data);
    this.resourceService.saveTags(resource.id, resource.tags).subscribe();
    this.cdr.markForCheck();
  }

  openResourceDetail(resource: LabResource, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.dialogService.openBigDialog(LabResourceDetailDialogComponent, {data: resource.id});
  }

  openInNewTab(event: MouseEvent): void {
    event.stopPropagation();
  }

  /**
   * Open the list of children resources of the current expanded resource
   */
  toggleResourceChildren(resource: LabResource, event: MouseEvent): void {
    this.expandedResource = this.expandedResource === resource ? null : resource;

    this.expandedChildrenResources$ = new FlEntityArrayObs(this.resourceService.getResourceChildren(resource.id));
    this.expandedChildrenStatus$ = this.expandedChildrenResources$.getStatus$();

    ClHelpService.stopEventPropagation(event);
  }

}
