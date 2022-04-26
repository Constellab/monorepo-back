import { Component, OnInit } from '@angular/core';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {HaBrick} from '../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {CmVersion} from '@monorepo/common-model';

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
      console.log(bricks[0].lastVersion)
      for(const b of bricks){
        b.lastVersion = new CmVersion(b.lastVersion.major, b.lastVersion.minor, b.lastVersion.patch, b.lastVersion.subPatch);
      }
      this.bricks = bricks;
    })
  }

}
