import {Component, OnInit} from '@angular/core';
import {HaBrickService} from '../../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute, Params} from '@angular/router';
import {HaBrick} from '../../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {Observable} from 'rxjs';

@Component({
  selector: 'ha-public-list-bricks-page',
  templateUrl: './ha-public-brick-page.component.html',
  styleUrls: ['./ha-public-brick-page.component.scss']
})
export class HaPublicBrickPageComponent implements OnInit {

  brick$: Observable<HaBrick>;

  activeLink: string;

  constructor(
    private brickService: HaBrickService,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.brick$ = this.brickService.getByName(params.brickName);
    });
    this.activatedRoute.children[0].url.subscribe((sectionUrl) => {
      this.activeLink = sectionUrl[0] ? sectionUrl[0].path : '.';
      console.log(sectionUrl);
    });
  }
}

