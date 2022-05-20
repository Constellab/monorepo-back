import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {FlArrayObs, FlDropEvent, FlTableAbstractDirective, FlTag, FlTagSelectedEvent} from '@monorepo/front-core-lib';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {LabDragType} from '../../../../model/global/lab-drag-type.class';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';

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

  @Output() resourceSelected: EventEmitter<LabResource> = new EventEmitter();

  @Output() tagSelected: EventEmitter<FlTag> = new EventEmitter();

  // enable drop tags
  supportedDropType: LabDragType = LabDragType.TAG;

  constructor(private cdr: ChangeDetectorRef,
              private resourceService: LabResourceService) {
    super(['created', 'action', 'name', 'info', 'tags']);
  }

  ngOnInit(): void {
  }

  rowClicked(resource: LabResource): void {
    if (this.selectableRow) {
      this.resourceSelected.next(resource);
    }
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
    this.tagSelected.next(tagEvent.tag);
  }

  onDrop(resource: LabResource, event: FlDropEvent<FlTag>): void {
    if(!event.data) return;

    resource.addTag(event.data);
    this.resourceService.saveTags(resource.id, resource.tags).subscribe();
    this.cdr.markForCheck();
  }
}
