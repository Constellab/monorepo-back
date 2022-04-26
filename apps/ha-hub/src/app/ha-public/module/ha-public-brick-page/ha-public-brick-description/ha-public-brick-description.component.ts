import {Component, OnInit} from '@angular/core';
import {HaBrick} from '../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute} from '@angular/router';
import {HaBrickVersion} from '../../../../ha-core/ha-model/ha-entities/ha-brick-version.class';
import {CmVersion} from '@monorepo/common-model';

@Component({
  selector: 'ha-public-brick-description-page',
  templateUrl: './ha-public-brick-description.component.html',
  styleUrls: ['./ha-public-brick-description.component.scss']
})
export class HaPublicBrickDescriptionComponent implements OnInit {

  brick: HaBrick;
  latestBrickVersion:HaBrickVersion;
  lastVersion: CmVersion;

  constructor(
    private route: ActivatedRoute,
    private brickService: HaBrickService
  ) { }

  ngOnInit(): void {
    this.route.parent.params.subscribe(params => {
      this.setLastBrickVersion(params.brickName);
      this.brickService.getByName(params.brickName).subscribe(brick => {
        this.brick = brick;
      });


    });
  }

  private setLastBrickVersion(brickName: string): void {
    this.brickService.getLastVersion(brickName).subscribe(res => {
      this.latestBrickVersion = res;
      this.lastVersion = new CmVersion(res.brickMajorVersion.major, res.minor, res.patch, res.subPatch);
    });
  }
}
