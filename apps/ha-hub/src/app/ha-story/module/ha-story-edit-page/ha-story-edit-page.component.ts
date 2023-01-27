import {Component, OnDestroy, OnInit} from '@angular/core';
import {HaStoryService} from '../../../ha-core/ha-service/ha-story.service';
import {HaStory, HaStoryContentFormDTO} from '../../../ha-core/ha-model/ha-entities/ha-story.class';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CmRichText, CmRichTextI} from '@monorepo/common-model';
import {FlConfirmDialogInput, FlDebouncer, FlDialogService} from '@monorepo/front-core-lib';
import {HaStoryTextEditorConfig} from './ha-story-text-editor.config';
import {mergeMap, Observable, of, startWith} from 'rxjs';
import {HaTopic, HaTopicDto} from '../../../ha-core/ha-model/ha-entities/ha-topic.class';
import {HaTopicService} from '../../../ha-core/ha-service/ha-topic.service';
import {map} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';

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


  topicControl: FormControl<string | HaTopic> = new FormControl<string | HaTopic>('');

  topics: HaTopicDto[];

  filteredTopics: Observable<HaTopicDto[]>;

  canSaveTopic: boolean = false;

  inputTopic: string = '';

  constructor(
    private storyService: HaStoryService,
    private activatedRoute: ActivatedRoute,
    private dialogService: FlDialogService,
    private topicService: HaTopicService
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

    this.topicService.getAll().subscribe(topics => {
      this.topics = topics;
      this.filteredTopics = this.topicControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          if (value == null || value == '') return [];
          const name = typeof value === 'string' ? value : value.name;
          this.canSaveTopic = name && name.trim() !== '';
          return name ? this._filter(name).slice(0, 3).filter((topic => !this.story.topics.find(t => t.id === topic.id))) :
            this.topics.slice(0, 3).filter((topic => !this.story.topics.find(t => t.id === topic.id)));
        }),
      );
    });
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

  saveTopic(): void {
    const topic: HaTopicDto = typeof this.topicControl.value === 'string' ?
      new HaTopicDto(this.topicControl.value) : new HaTopicDto(this.topicControl.value.name, this.topicControl.value.id);

    if (topic.id == null) {
      const input: FlConfirmDialogInput = {
        title: 'new_topic',
        content: 'new_topic_content',
        translateTitleAndContent: true,
        observable: this.addTopicToStory(topic)
      }

      this.dialogService.openConfirmDialog(input).afterClosed().subscribe();

    } else {
      this.addTopicToStory(topic).subscribe();
    }
  }

  addTopicToStory(topic: HaTopicDto): Observable<HaTopic> {
    return this.storyService.addTopicToStory(topic, this.story.id).pipe(
      mergeMap((res: HaTopic) => {
        this.story.topics.push(res);
        this.topicControl.setValue('');
        this.inputTopic = '';
        if (this.story.topics.length >= 5) this.topicControl.disable();
        return of(res);
      })
    );
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

  displayFn(topic: HaTopic): string {
    return topic && topic.name ? topic.name : '';
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

  removeTopic(topic: HaTopic): void {
    this.storyService.removeTopicFromStory(topic.id, this.story.id).subscribe(() => {
      this.story.topics = this.story.topics.filter(t => t.id !== topic.id);
      this.topics = this.topics.filter(t => t.id !== topic.id);
      this.topicControl.enable();
    });
  }

  private getStory(id: string): void {
    this.storyService.getById(id).subscribe(story => {
      this.story = story;
      if (this.story.topics.length >= 5) this.topicControl.disable();
      this.formGp.patchValue(this.story);
    });
  }

  private _filter(name: string): HaTopicDto[] {
    const filterValue = name.toLowerCase();

    return this.topics.filter(topic => topic.name.toLowerCase().includes(filterValue));
  }

  onSelectTopic(event: MatAutocompleteSelectedEvent): void {
    this.addTopicToStory(event.option.value).subscribe();
  }
}
