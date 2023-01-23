import { Component, OnInit } from '@angular/core';
import { HaStoryService } from '../../../ha-core/ha-service/ha-story.service';
import {HaMyStoriesDataSource, HaStory} from '../../../ha-core/ha-model/ha-entities/ha-story.class';
import {
  HaCreateStoryDtoInput,
  HaStoryCreateDialogComponent
} from '../ha-story-create-dialog/ha-story-create-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {Router} from '@angular/router';

@Component({
  selector: 'ha-ha-story-my-list',
  templateUrl: './ha-story-my-list.component.html',
  styleUrls: ['./ha-story-my-list.component.scss']
})
export class HaStoryMyListComponent implements OnInit {

  myStories: HaMyStoriesDataSource;
  displayedColumns: string[] = ['title', 'status', 'createdAt', 'button'];

  constructor(
    private storyService: HaStoryService,
    private dialogService: FlDialogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.myStories = this.storyService.getMyStories();
  }

  openCreateDocDialog(): void{

    const input: HaCreateStoryDtoInput = {
      mode: 'create'
    }

    this.dialogService.openSmallDialog(HaStoryCreateDialogComponent, {data: input}).afterClosed().subscribe((story: HaStory) => {
      if (story){
        this.router.navigate(['stories/edit/', story.id]);
      }
    });
  }
}
