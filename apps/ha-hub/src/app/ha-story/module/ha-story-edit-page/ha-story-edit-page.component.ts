import {Component, OnInit} from '@angular/core';
import {HaStoryService} from '../../../ha-core/ha-service/ha-story.service';

@Component({
  selector: 'ha-ha-story-edit-page',
  templateUrl: './ha-story-edit-page.component.html',
  styleUrls: ['./ha-story-edit-page.component.scss']
})
export class HaStoryEditPageComponent implements OnInit {


  constructor(
    private storyService: HaStoryService
  ) {
  }

  ngOnInit(): void {

  }

}
