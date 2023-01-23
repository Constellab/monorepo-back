import {Component, OnDestroy, OnInit} from '@angular/core';
import {HaStoryService} from '../../../ha-core/ha-service/ha-story.service';
import {HaStory, HaStoryContentFormDTO} from '../../../ha-core/ha-model/ha-entities/ha-story.class';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CmRichText, CmRichTextI} from '@monorepo/common-model';
import {FlConfirmDialogInput, FlDebouncer, FlDialogService} from '@monorepo/front-core-lib';
import {HaStoryTextEditorConfig} from './ha-story-text-editor.config';
import {Observable} from 'rxjs';

@Component({
  selector: 'ha-ha-story-edit-page',
  templateUrl: './ha-story-edit-page.component.html',
  styleUrls: ['./ha-story-edit-page.component.scss']
})
export class HaStoryEditPageComponent implements OnInit, OnDestroy {

  story: HaStory;

  titleChange: boolean = false;
  inputTitle: string;

  formGp: FormGroup<Partial<HaStoryContentFormDTO>>;
  textEditorConfig: HaStoryTextEditorConfig;

  contentEditorIsFocused: boolean = false;
  private contentDebouncer: FlDebouncer<CmRichTextI>;

  contentHasError: boolean = false;

  contentError: string;


  constructor(
    private storyService: HaStoryService,
    private activatedRoute: ActivatedRoute,
    private dialogService: FlDialogService
  ) {
  }

  ngOnInit(): void {
    this.buildForm();

    this.textEditorConfig =
      new HaStoryTextEditorConfig(this.storyService, this.dialogService);

    this.activatedRoute.params.subscribe(params => {
      this.getStory(params.id);
    });

    //create a debouncer to save the description after x second of idle
    this.contentDebouncer = new FlDebouncer(FlDebouncer.AUTO_SAVE_DEBOUNCE_TIME);
    this.contentDebouncer.getDebouncedValue().subscribe(
      value => {
        if (this.story && this.story.content !== value) {
          this.saveContent(value);
        }
      }
    );
  }

  onTitleChange(event: any): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    if (this.story.title !== input.value && input.value.length > 0) {
      this.titleChange = true;
      this.inputTitle = input.value;
    } else {
      this.titleChange = false;
    }
  }

  saveTitle(): void {
    this.storyService.updateTitle(this.story.id, this.inputTitle).subscribe((story) => {
      this.story.title = story.title;
      this.titleChange = false;
    });
  }

  onContentUpdate(content: any): void {
    this.contentDebouncer.setValue(content);
  }

  ngOnDestroy(): void {
    this.contentDebouncer.complete();
  }

  buildForm(): void {
    this.formGp = new FormBuilder().group({
      id: [null],
      content: [null]
    });
  }

  private getStory(id: string): void {
    this.storyService.getById(id).subscribe(story => {
      this.story = story;
      this.formGp.patchValue(this.story);
    });
  }

  private saveContent(value: CmRichTextI): void {
    this.storyService.updateContent(this.story.id, value).subscribe();
  }

  onFocus(event: any): void {
    this.contentEditorIsFocused = true;
  }

  onUnFocus(event: any): void {
    this.contentEditorIsFocused = false;
  }

  publish(): void {

    if(new CmRichText(this.formGp.get('content').value).getFirstFigureLink().length > 0){
      this.contentHasError = false;
      const input: FlConfirmDialogInput = {
        title: 'publish_story',
        content: 'publish_story_dialog_content',
        successMessage: 'story_published',
        observable: this.publishStory(),
        translateMessage: true,
        translateTitleAndContent: true
      }
      this.dialogService.openConfirmDialog(input).afterClosed().subscribe((res) => {
        console.log(res);
        if (res.choice && res.result) {
          this.story = res.result;
        }
      });
    } else {
      this.contentHasError = true;
      this.contentError = 'story_content_no_picture_error';
    }
  }

  private publishStory(): Observable<HaStory> {
    return this.storyService.publishStory(this.story.id);
  }
}
