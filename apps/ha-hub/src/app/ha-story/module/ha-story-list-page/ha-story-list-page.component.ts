import { Component, OnInit } from '@angular/core';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  HaCreateStoryDtoInput,
  HaStoryCreateDialogComponent
} from '../ha-story-create-dialog/ha-story-create-dialog.component';
import {HaStory, HaStoryDatasourcePaginated} from '../../../ha-core/ha-model/ha-entities/ha-story.class';
import {Router} from '@angular/router';
import {HaStoryService} from '../../../ha-core/ha-service/ha-story.service';

@Component({
  selector: 'ha-ha-story-list-page',
  templateUrl: './ha-story-list-page.component.html',
  styleUrls: ['./ha-story-list-page.component.scss']
})
export class HaStoryListPageComponent implements OnInit {


  stories: HaStoryDatasourcePaginated;

  constructor(private dialogService: FlDialogService,
              private router: Router,
              private storyService: HaStoryService) { }

  ngOnInit(): void {
    this.stories = this.storyService.getAllPaginated();
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

  getStoryImageLink(imageName: string): string{
    return this.storyService.getImageUrl(imageName);
  }
}
