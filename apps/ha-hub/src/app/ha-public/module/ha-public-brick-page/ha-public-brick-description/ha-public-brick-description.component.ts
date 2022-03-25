import {Component, OnInit} from '@angular/core';
import {HaBrick} from '../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {HaBrickVersion} from '../../../../ha-core/ha-model/ha-entities/ha-brick-version.class';

@Component({
  selector: 'ha-public-brick-description-page',
  templateUrl: './ha-public-brick-description.component.html',
  styleUrls: ['./ha-public-brick-description.component.scss']
})
export class HaPublicBrickDescriptionComponent implements OnInit {

  brick: HaBrick;
  latestBrickVersion$: Observable<HaBrickVersion>

  constructor(
    private route: ActivatedRoute,
    private brickService: HaBrickService
  ) { }

  ngOnInit(): void {
    this.route.parent.params.subscribe(params => {
      this.brickService.getByName(params.brickName).subscribe(brick => {
        this.brick = brick;
      });
      this.setLastBrickVersion(params.brickName);

    });
  }

  private setLastBrickVersion(brickName: string): void {
    this.latestBrickVersion$ = this.brickService.getLastVersion(brickName);
  }
}
