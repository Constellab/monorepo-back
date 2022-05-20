import {Component, EventEmitter, OnInit, Optional, Output, Self} from '@angular/core';
import {LabTagService} from '../../../../entity-service/lab-tag.service';
import {FlFormFieldDirective, FlTag} from '@monorepo/front-core-lib';
import {NgControl} from '@angular/forms';
import {LabTagEntity} from '../../../../model/entities/lab-tag.entity';


interface LabTagEntityWithSelection {
  tag: LabTagEntity;
  selectedValue: FlTag;
}

/**
 * list all the tag of the lab with possibility to add new tag, sort them,
 * and drag tag outside the list (like to tag Resource or Experiment)
 */
@Component({
  selector: 'lab-tag-dashboard',
  templateUrl: './lab-tag-dashboard.component.html',
  styleUrls: ['./lab-tag-dashboard.component.scss']
})
export class LabTagDashboardComponent extends FlFormFieldDirective<FlTag[]> implements OnInit {


  @Output() selectionChange: EventEmitter<FlTag[]> = new EventEmitter();

  tags: LabTagEntityWithSelection[];

  constructor(@Optional() @Self() ngControl: NgControl,
              private tagService: LabTagService) {
    super(ngControl);
  }

  ngOnInit(): void {
    this.getTags();
  }

  private getTags(): void {
    this.tagService.getAllTags().subscribe(
      tags => this.getTagsSuccess(tags),
    );
  }

  private getTagsSuccess(tags: LabTagEntity[]): void {
    this.tags = tags.map(tag => ({
      tag: tag,
      selectedValue: null
    }));

    // initialize the selected value
    if (this.value) {
      this.setTagSelection(this.value);
    }
  }

  writeValue(obj: FlTag[]): void {
    this.value = obj ?? [];

    this.setTagSelection(this.value);
  }

  private setTagSelection(selectedTags: FlTag[]): void {
    if (!this.tags) return;

    if (selectedTags == null) {
      selectedTags = [];
    }

    for (const tagWithSelection of this.tags) {
      tagWithSelection.selectedValue = selectedTags.find(tag => tag.key === tagWithSelection.tag.key);
    }
  }

  callChangeEvent(value: FlTag[]): void {
    this.selectionChange.next(value);
  }

  onDisableChange(disable: boolean): void {
  }


  selectTag(tagWithSelection: LabTagEntityWithSelection, selectedValue: string): void {
    if (selectedValue == null) {
      tagWithSelection.selectedValue = null;
    } else {
      tagWithSelection.selectedValue = {key: tagWithSelection.tag.key, value: selectedValue};
    }

    const selectedTags: FlTag[] = this.tags.filter(tag => tag.selectedValue != null).map(tag => tag.selectedValue);
    this.setAndEmitValue(selectedTags);
  }
}
