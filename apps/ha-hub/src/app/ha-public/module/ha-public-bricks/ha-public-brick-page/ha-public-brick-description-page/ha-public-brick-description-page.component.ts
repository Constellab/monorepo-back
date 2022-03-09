import { Component, OnInit } from '@angular/core';
import {HaBrick} from '../../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {HaBrickService} from '../../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';

@Component({
  selector: 'ha-public-brick-description-page',
  templateUrl: './ha-public-brick-description-page.component.html',
  styleUrls: ['./ha-public-brick-description-page.component.scss']
})
export class HaPublicBrickDescriptionPageComponent implements OnInit {

  brick$: Observable<HaBrick>;

  constructor(
    private route: ActivatedRoute,
    private brickService: HaBrickService
  ) { }

  ngOnInit(): void {
    this.route.parent.url.subscribe(url => {
      this.brick$ = this.brickService.getByName(url[0].path);
    });
  }

}
