import {Component, OnInit} from '@angular/core';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HaBrick} from '../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {Observable} from 'rxjs';

@Component({
  selector: 'ha-public-list-bricks-page',
  templateUrl: './ha-public-brick-page.component.html',
  styleUrls: ['./ha-public-brick-page.component.scss']
})
export class HaPublicBrickPageComponent implements OnInit {

  brick$: Observable<HaBrick>;
  brickNotFound: boolean = false;

  constructor(
    private brickService: HaBrickService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {

    if(this.router.url.includes('tech-doc') || this.router.url.includes('product-doc')){
      this.initBrick(this.router.url.includes('tech-doc') ? 'gws_core' : 'gws_academy');
    } else {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.initBrick(params.brickName);
      });
    }
  }

  private initBrick(name: string): void{
    this.brickNotFound = false;
    this.brick$ = this.brickService.getByName(name);
    this.brick$.subscribe((brick) => {
      if(brick == null){
        this.brickNotFound = true;
      }
    })
  }
}

