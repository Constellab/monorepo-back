import { Component, OnInit } from '@angular/core';
import {HaBrickService} from '../../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute, Params, UrlSegment} from '@angular/router';
import {HaBrick} from '../../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {Observable} from 'rxjs';

@Component({
  selector: 'ha-public-list-bricks-page',
  templateUrl: './ha-public-brick-page.component.html',
  styleUrls: ['./ha-public-brick-page.component.scss']
})
export class HaPublicBrickPageComponent implements OnInit {

  brick$: Observable<HaBrick>;

  constructor(
    private daBrickService: HaBrickService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.brick$ = this.daBrickService.getByName(params.brickName);
    });
  }
}

