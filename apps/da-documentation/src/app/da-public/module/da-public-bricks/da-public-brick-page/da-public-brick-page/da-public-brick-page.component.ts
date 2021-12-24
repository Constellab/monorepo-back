import { Component, OnInit } from '@angular/core';
import {DaBrickService} from '../../../../../da-core/da-service/da-brick.service';
import {ActivatedRoute, UrlSegment} from '@angular/router';
import {DaBrick} from '../../../../../da-core/da-model/da-entities/da-brick.class';
import {Observable} from 'rxjs';

@Component({
  selector: 'da-public-list-bricks-page',
  templateUrl: './da-public-brick-page.component.html',
  styleUrls: ['./da-public-brick-page.component.scss']
})
export class DaPublicBrickPageComponent implements OnInit {

  brick$: Observable<DaBrick>;

  constructor(
    private daBrickService: DaBrickService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.url.subscribe((url: UrlSegment[]) => {
      this.brick$ = this.daBrickService.getByName(url[0].path);
    });
  }

}
