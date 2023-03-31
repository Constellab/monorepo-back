import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HaStoryService} from '../../../ha-core/ha-service/ha-story.service';
import {HaStory} from '../../../ha-core/ha-model/ha-entities/ha-story.class';
import {HaStoryTextEditorConfig} from '../ha-story-edit-page/ha-story-text-editor.config';
import {FlDialogService} from '@monorepo/front-core-lib';
import {FormControl} from '@ngneat/reactive-forms';
import {CmRichText, CmRichTextI} from '@monorepo/common-model';

@Component({
  selector: 'ha-ha-story-page',
  templateUrl: './ha-story-page.component.html',
  styleUrls: ['./ha-story-page.component.scss']
})
export class HaStoryPageComponent implements OnInit {

  story: HaStory;

  textEditorConfig: HaStoryTextEditorConfig;

  formControl: FormControl<CmRichTextI> = new FormControl<CmRichTextI>();

  titles: any[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private storyService: HaStoryService,
    private dialogService: FlDialogService
  ) {
  }

  ngOnInit(): void {
    this.textEditorConfig = new HaStoryTextEditorConfig(this.storyService, this.dialogService);

    this.activatedRoute.params.subscribe(params => {
      this.getStory(params.id);
    });
  }

  private getStory(id: string): void {
    this.storyService.getById(id).subscribe((story: HaStory) => {
      this.story = story;
      this.formControl.setValue(this.story.content);
      this.formControl.disable({emitEvent: true});
      this.titles = (new CmRichText(this.story.content)).getHeaders([2, 3]);
    });
  }
}
