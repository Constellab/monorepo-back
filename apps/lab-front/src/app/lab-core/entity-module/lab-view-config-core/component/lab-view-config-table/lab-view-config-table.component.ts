import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlDropEvent, FlPaginatedTableAbstractDirective, FlTag, FlTagSelectedEvent} from '@monorepo/front-core-lib';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {LabDragType} from '../../../../model/global/lab-drag-type.class';
import {LabViewConfigService} from '../../../../entity-service/lab-view-config.service';

@Component({
  selector: 'lab-view-config-table',
  templateUrl: './lab-view-config-table.component.html',
  styleUrls: ['./lab-view-config-table.component.scss']
})
export class LabViewConfigTableComponent extends FlPaginatedTableAbstractDirective<LabViewConfig> implements OnInit {

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() selectableRow: boolean = false;

  @Input() tagSelectable: boolean = true;

  @Output() tagSelected: EventEmitter<FlTag> = new EventEmitter();

  @Output() viewConfigSelected: EventEmitter<LabViewConfig> = new EventEmitter();

  // enable drop tags
  supportedDropType: LabDragType = LabDragType.TAG;


  constructor(private viewConfigService: LabViewConfigService) {
    super(['title', 'createdAt', 'preview', 'resource', 'action', 'tags', 'flagged']);
  }

  ngOnInit(): void {
  }

  rowClicked(viewConfig: LabViewConfig): void {
    if (this.selectableRow) {
      this.viewConfigSelected.next(viewConfig);
    }
  }

  onUpdate(viewConfig: LabViewConfig): void {
    this.datasource.updateItem(viewConfig);
  }


  onUpdateTags(viewConfig: LabViewConfig, newTags: LabTag[]): void {
    if (newTags != null) {
      viewConfig.tags = newTags;
    }
  }

  onTagSelected(tagEvent: FlTagSelectedEvent): void {
    ClHelpService.stopEventPropagation(tagEvent.event);
    this.tagSelected.next(tagEvent.tag);
  }

  onDrop(viewConfig: LabViewConfig, event: FlDropEvent<FlTag>): void {
    if (!event.data) return;

    viewConfig.addTag(event.data);
    this.viewConfigService.saveTags(viewConfig.id, viewConfig.tags).subscribe();
  }
}
