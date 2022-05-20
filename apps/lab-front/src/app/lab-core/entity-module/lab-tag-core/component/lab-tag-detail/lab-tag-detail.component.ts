import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LabTagEntity} from '../../../../model/entities/lab-tag.entity';
import {LabDragType} from '../../../../model/global/lab-drag-type.class';
import {FlTag, FlTagHelper} from '@monorepo/front-core-lib';

@Component({
  selector: 'lab-tag-detail',
  templateUrl: './lab-tag-detail.component.html',
  styleUrls: ['./lab-tag-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabTagDetailComponent implements OnInit {

  @Input() tagEntity: LabTagEntity;

  @Input() selectedValue: string;
  @Output() selectedValueChange: EventEmitter<string> = new EventEmitter();

  isExpanded: boolean = false;

  dragType: LabDragType = LabDragType.TAG;

  constructor() {
  }

  ngOnInit(): void {
    if(this.selectedValue){
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

  getBorderColor(value: string): string {
    return this.isSelected(value) ? FlTagHelper.getTagDefaultColor(this.tagEntity.key, value)
      : 'transparent';
  }

  isSelected(value: string): boolean {
    return this.selectedValue === value;
  }

}
