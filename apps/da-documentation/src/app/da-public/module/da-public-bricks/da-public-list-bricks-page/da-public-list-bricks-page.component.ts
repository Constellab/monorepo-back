import { Component, OnInit } from '@angular/core';
import {DaBrickService} from '../../../../da-core/da-service/da-brick.service';
import {DaBrick} from '../../../../da-core/da-model/da-entities/da-brick.class';

@Component({
  selector: 'da-public-list-bricks-page',
  templateUrl: './da-public-list-bricks-page.component.html',
  styleUrls: ['./da-public-list-bricks-page.component.scss']
})
export class DaPublicListBricksPageComponent implements OnInit {

  bricks: DaBrick[];

  constructor(
    private daBrickService: DaBrickService
  ) { }

  ngOnInit(): void {
    this.daBrickService.get().subscribe((bricks: DaBrick[]) => {
      this.bricks = bricks;
    })
  }

}
