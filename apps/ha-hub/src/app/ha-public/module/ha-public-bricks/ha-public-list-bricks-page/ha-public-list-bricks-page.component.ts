import { Component, OnInit } from '@angular/core';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {HaBrick} from '../../../../ha-core/ha-model/ha-entities/ha-brick.class';

@Component({
  selector: 'ha-public-list-bricks-page',
  templateUrl: './ha-public-list-bricks-page.component.html',
  styleUrls: ['./ha-public-list-bricks-page.component.scss']
})
export class HaPublicListBricksPageComponent implements OnInit {

  bricks: HaBrick[];

  constructor(
    private daBrickService: HaBrickService
  ) { }

  ngOnInit(): void {
    this.daBrickService.get().subscribe((bricks: HaBrick[]) => {
      this.bricks = bricks;
    })
  }

}
