import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {FlArrayObs, FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {LabTag} from '../../../../model/entities/lab-tag.entity';

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

  @Output() resourceSelected: EventEmitter<LabResource> = new EventEmitter<LabResource>();

  constructor(private cdr: ChangeDetectorRef) {
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
}
