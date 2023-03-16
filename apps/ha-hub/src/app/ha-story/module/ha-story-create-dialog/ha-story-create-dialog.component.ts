import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {HaCreateStoryDto, HaStory, HaStoryCategory} from '../../../ha-core/ha-model/ha-entities/ha-story.class';
import {HaStoryService} from '../../../ha-core/ha-service/ha-story.service';
import {Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export type HaCreateStoryDtoInput = FlFormDialogInput<HaCreateStoryDto>;

@Component({
  selector: 'ha-ha-story-create-dialog',
  templateUrl: './ha-story-create-dialog.component.html',
  styleUrls: ['./ha-story-create-dialog.component.scss']
})
export class HaStoryCreateDialogComponent extends FlFormDialogAbstractDirective<HaCreateStoryDto, HaStory> implements OnInit {

  constructor(snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<HaStoryCreateDialogComponent>,
              @Inject(MAT_DIALOG_DATA) dialogInput: HaCreateStoryDtoInput,
              private storyService: HaStoryService) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<HaCreateStoryDto> {
    return new FormBuilder().group({
      title: [null, Validators.required],
      category: [HaStoryCategory.ARTICLE, Validators.required]
    })
  }

  create(formValue: HaCreateStoryDto): Observable<HaStory> {
    return this.storyService.create(formValue);
  }

  update(formValue: HaCreateStoryDto): Observable<HaStory> {
    throw new Error('Method not implemented.');
  }

  getCreateSuccessMessage(): string {
    return 'story_created';
  }

  getUpdateSuccessMessage(): string {
    throw new Error('Method not implemented.');
  }
}
