import {Component, EventEmitter, OnInit, Optional, Output, Self} from '@angular/core';
import {LabTagService} from '../../../../entity-service/lab-tag.service';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlFormDialogInput,
  FlFormFieldDirective,
  FlTag
} from '@monorepo/front-core-lib';
import {NgControl} from '@angular/forms';
import {LabTagEntity} from '../../../../model/entities/lab-tag.entity';
import {LabTagFormDialogComponent} from '../lab-tag-form-dialog/lab-tag-form-dialog.component';
import {ClHelpService} from '@monorepo/core-lib';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {LabTagHelpDialogComponent} from '../lab-tag-help-dialog/lab-tag-help-dialog.component';


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

  isLoading: boolean = false;

  constructor(@Optional() @Self() ngControl: NgControl,
              private tagService: LabTagService,
              private dialogService: FlDialogService) {
    super(ngControl);
  }

  ngOnInit(): void {
    this.getTags();
  }

  private getTags(): void {
    this.isLoading = true;
    this.tagService.getAllTags().subscribe(
      {
        next: tags => this.getTagsSuccess(tags),
        error: () => this.isLoading = false
      }
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
    this.isLoading = false;
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

  onDisableChange(): void {
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

  openAddTagDialog(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);

    const input: FlFormDialogInput<FlTag> = {
      mode: 'create',
    };

    this.dialogService.openSmallDialog(LabTagFormDialogComponent, {data: input}).afterClosed().subscribe(
      tagEntity => this.refreshTagEntity(tagEntity)
    );
  }

  openAddValueDialog(key: string): void {
    const input: FlFormDialogInput<FlTag> = {
      mode: 'create',
      object: {key: key, value: null}
    };

    this.dialogService.openSmallDialog(LabTagFormDialogComponent, {data: input}).afterClosed().subscribe(
      tagEntity => this.refreshTagEntity(tagEntity)
    );
  }

  openUpdateValueDialog(tag: FlTag): void {
    const input: FlFormDialogInput<FlTag> = {
      mode: 'update',
      object: tag
    };

    this.dialogService.openSmallDialog(LabTagFormDialogComponent, {data: input}).afterClosed().subscribe(
      tagEntity => this.refreshTagEntity(tagEntity)
    );
  }

  private refreshTagEntity(tagEntity?: LabTagEntity): void {
    if (!tagEntity) return;

    const index = this.tags.findIndex(tag => tag.tag.key === tagEntity.key);
    if (index >= 0) {
      this.tags[index] = {
        tag: tagEntity,
        selectedValue: null
      };
    } else {
      this.tags.push({
        tag: tagEntity,
        selectedValue: null
      });
    }
  }

  openDeleteTag(tag: FlTag): void {
    const data: FlConfirmDialogInput = {
      title: 'tag_delete',
      content: 'tag_delete_confirmation',
      translateTitleAndContent: true,
      observable: this.tagService.deleteTag(tag.key, tag.value),
      successMessage: 'tag_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onDeleteClosed(result, tag)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult,
                         tag: FlTag): void {
    if (!result.choice) return;

    const index = this.tags.findIndex(t => t.tag.key === tag.key);
    if (index >= 0) {
      const tagEntity = this.tags[index].tag;
      // if we deleted the last value, we remove the TagEntity
      if (tagEntity.values.length === 1) {
        this.tags.splice(index, 1);
      } else {
        // delete only the value
        const valueIndex = tagEntity.values.indexOf(tag.value);
        if (valueIndex >= 0) {
          const newTagEntity = tagEntity.clone();
          newTagEntity.values.splice(valueIndex, 1);

          this.tags[index] = {
            tag: newTagEntity,
            selectedValue: null,
          };
        }
      }

    }
  }

  reorderTags(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.tags, event.previousIndex, event.currentIndex);

    const keys = this.tags.map(tag => tag.tag.key);
    this.tagService.reorderTags(keys).subscribe();
  }

  openTagHelpDialog(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.dialogService.openSmallDialog(LabTagHelpDialogComponent);
  }
}
