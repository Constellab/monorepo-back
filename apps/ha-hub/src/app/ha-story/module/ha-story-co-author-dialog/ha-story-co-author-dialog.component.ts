import {Component, Inject, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlDialogService,
  FlFormDialogAbstractDirective,
  FlFormDialogInput,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {HaStory, HaStoryAuthor} from '../../../ha-core/ha-model/ha-entities/ha-story.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HaStoryService} from '../../../ha-core/ha-service/ha-story.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {ClStringHelper} from '@monorepo/core-lib';

export type HaCreateStoryDtoInput = FlFormDialogInput<HaCoAuthorFormData>;

export interface HaCoAuthorFormData {
  storyAuthors?: HaStoryAuthor[];
  id?: string;

  coAuthors: HaCoAuthorEmail[];
}

export interface HaCoAuthorEmail {
  id?: string;
  fullName?: string;
  email: string;
}

@Component({
  selector: 'ha-story-co-author-dialog',
  templateUrl: './ha-story-co-author-dialog.component.html',
  styleUrls: ['./ha-story-co-author-dialog.component.scss']
})
export class HaStoryCoAuthorDialogComponent extends FlFormDialogAbstractDirective<HaCoAuthorFormData, HaStory> implements OnInit {

  coAuthors: HaCoAuthorEmail[] = [];
  storyId: string;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  constructor(snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<HaStoryCoAuthorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) dialogInput: HaCreateStoryDtoInput,
              private dialogService: FlDialogService,
              private storyService: HaStoryService) {
    super(dialogInput, snackBarService, dialogRef);
    this.storyId = dialogInput.object.id;
    this.coAuthors = dialogInput.object.storyAuthors.map(sA => ({id: sA.id, fullName: sA.user.fullname, email: sA.user.email})).slice(1);
  }

  ngOnInit(): void {
    this.formGp = this.buildForm();
  }

  buildForm(): FormGroup<HaCoAuthorFormData> {
    return new FormBuilder().group({
      coAuthors: [this.coAuthors, Validators.required]
    })
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value && RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/).test(value)) {
      this.coAuthors.push({email: value});
      this.formGp.patchValue({coAuthors: this.coAuthors});
    }

    // Clear the input value
    event.chipInput?.clear();
  }

  openRemoveConfirmDialog(coAuthor: HaCoAuthorEmail): void {
    const input: FlConfirmDialogInput = {
      title: 'remove_coauthor',
      content: 'remove_coauthor_dialog_content',
      translateTitleAndContent: true,
      successMessage: 'remove_coauthor_success',
      translateMessage: true,
      observable: this.storyService.removeStoryCoAuthor(this.storyId, coAuthor.id)
    }

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(result => {
      if (result) {
        this.remove(coAuthor);
      }
    });
  }

  remove(coAuthor: HaCoAuthorEmail): void {
    const index = this.coAuthors.indexOf(coAuthor);

    if (index >= 0) {
      this.coAuthors.splice(index, 1);
      this.formGp.patchValue({coAuthors: this.coAuthors});
    }
  }

  create(formValue: HaCoAuthorFormData): Observable<HaStory> {
    throw new Error('Method not implemented.');
  }

  update(formValue: HaCoAuthorFormData): Observable<HaStory> {
    if(formValue.coAuthors.length > 0) {
      const newCoAuthors = formValue.coAuthors.filter(coAuthor => !coAuthor.id);
      return this.storyService.updateStoryCoAuthors(this.storyId, newCoAuthors.map(coAuthor => coAuthor.email));
    }
    return null;
  }

  getCreateSuccessMessage(): string {
    throw new Error('Method not implemented.');
  }

  getUpdateSuccessMessage(): string {
    return 'coauthors_updated_successfully';
  }

}
