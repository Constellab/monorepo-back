import { Component, OnInit } from '@angular/core';
import {HaBrickVersionDataSource} from '../../../../../ha-core/ha-model/ha-entities/ha-brick-version.class';
import {HaBrickVersionService} from '../../../../../ha-core/ha-service/ha-brick-version.service';
import {ActivatedRoute} from '@angular/router';
import {HaBrickService} from '../../../../../ha-core/ha-service/ha-brick.service';
import {FlTableColumn} from '@monorepo/front-core-lib';
import {CaLabFrontVersion} from '../../../../../../../../ca-central-front/src/app/ca-core/model/entities/ca-lab-front-version.class';

@Component({
  selector: 'ha-public-versions-page',
  templateUrl: './ha-public-versions-page.component.html',
  styleUrls: ['./ha-public-versions-page.component.scss']
})
export class HaPublicVersionsPageComponent implements OnInit {

  brickVersions: HaBrickVersionDataSource;
  brickId: string;
  displayedColumns: FlTableColumn<CaLabFrontVersion>[] = ['version', 'lastModified'];

  constructor(
    private brickVersionService: HaBrickVersionService,
    private route: ActivatedRoute,
    private brickService: HaBrickService
  ) { }

  ngOnInit(): void {
    this.route.parent.url.subscribe(url => {
      this.brickService.getByName(url[0].path).subscribe(brick => {
        this.brickId = brick.id;
        this.brickVersions = this.brickVersionService.getDataSource(this.brickId);
        console.log(this.brickVersions)
      });
    });
  }

}
