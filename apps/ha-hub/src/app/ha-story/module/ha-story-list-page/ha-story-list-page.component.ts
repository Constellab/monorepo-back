import { Component, OnInit } from '@angular/core';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  HaCreateStoryDtoInput,
  HaStoryCreateDialogComponent
} from '../ha-story-create-dialog/ha-story-create-dialog.component';
import {HaStory} from '../../../ha-core/ha-model/ha-entities/ha-story.class';
import {Router} from '@angular/router';

@Component({
  selector: 'ha-ha-story-list-page',
  templateUrl: './ha-story-list-page.component.html',
  styleUrls: ['./ha-story-list-page.component.scss']
})
export class HaStoryListPageComponent implements OnInit {

  constructor(private dialogService: FlDialogService,
              private router: Router) { }

  ngOnInit(): void {
  }


  openCreateDocDialog(): void{

    const input: HaCreateStoryDtoInput = {
      mode: 'create'
    }

    this.dialogService.openSmallDialog(HaStoryCreateDialogComponent, {data: input}).afterClosed().subscribe((story: HaStory) => {
      if (story){
        this.router.navigate(['/edit/', story.id]);
      }
    });
  }
}
