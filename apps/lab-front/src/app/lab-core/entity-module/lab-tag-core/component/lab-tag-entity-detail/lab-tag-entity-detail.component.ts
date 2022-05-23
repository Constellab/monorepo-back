import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Optional, Output, Self} from '@angular/core';
import {LabTagEntity} from '../../../../model/entities/lab-tag.entity';
import {LabDragType} from '../../../../model/global/lab-drag-type.class';
import {FlFormFieldDirective, FlTag} from '@monorepo/front-core-lib';
import {NgControl} from '@angular/forms';
import {ClHelpService} from '@monorepo/core-lib';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {LabTagService} from '../../../../entity-service/lab-tag.service';

/**
 * Component to show the LabTagEntity information
 * In this component you can select a tag value (with NgModel)
 * It also supports an add, update and delete tag value button
 */
@Component({
  selector: 'lab-tag-entity-detail',
  templateUrl: './lab-tag-entity-detail.component.html',
  styleUrls: ['./lab-tag-entity-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabTagEntityDetailComponent extends FlFormFieldDirective<string> implements OnInit {

  @Input() tagEntity: LabTagEntity;

  @Input() selectedValue: string;
  @Output() selectedValueChange: EventEmitter<string> = new EventEmitter();

  @Output() addTagValue: EventEmitter<string> = new EventEmitter();
  @Output() updateTagValue: EventEmitter<FlTag> = new EventEmitter();
  @Output() deleteTagValue: EventEmitter<FlTag> = new EventEmitter();

  isExpanded: boolean = false;

  dragType: LabDragType = LabDragType.TAG;

  constructor(@Optional() @Self() ngControl: NgControl,
              private tagService: LabTagService) {
    super(ngControl);
  }

  ngOnInit(): void {
    if (this.selectedValue) {
      this.isExpanded = true;
    }
  }

  callChangeEvent(value: string): void {
    this.selectedValueChange.next(value);
  }

  onDisableChange(): void {
  }

  writeValue(obj: string): void {
    this.selectedValue = obj;
    if (obj) {
      this.isExpanded = true;
    }
  }


  get icon(): string {
    return this.isExpanded ? 'expand_more' : 'chevron_right';
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }


  selectTag(value: string): void {
    if (value === this.selectedValue) {
      this.selectedValue = null;
    } else {
      this.selectedValue = value;
    }

    this.selectedValueChange.next(this.selectedValue);
  }

  getFlTag(value: string): FlTag {
    return {key: this.tagEntity.key, value: value};
  }


  isSelected(value: string): boolean {
    return this.selectedValue === value;
  }

  addTagValueClick(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.addTagValue.next(this.tagEntity.key);
  }

  updateTagValueClick(value: string, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.updateTagValue.next(this.getFlTag(value));
  }

  deleteTagValueClick(value: string, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.deleteTagValue.next(this.getFlTag(value));
  }

  reorderValues(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.tagEntity.values, event.previousIndex, event.currentIndex);

    this.tagService.reorderTagValues(this.tagEntity.key, this.tagEntity.values).subscribe();
  }

}
