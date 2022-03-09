import { Component, OnInit } from '@angular/core';
import {HaBrickVersionDataSource} from '../../../../../ha-core/ha-model/ha-entities/ha-brick-version.class';
import {HaBrickVersionService} from '../../../../../ha-core/ha-service/ha-brick-version.service';
import {ActivatedRoute} from '@angular/router';
import {HaBrickService} from '../../../../../ha-core/ha-service/ha-brick.service';
import {FlDialogService, FlFormDialogInput, FlTableColumn} from '@monorepo/front-core-lib';
import {CaLabFrontVersion} from '../../../../../../../../ca-central-front/src/app/ca-core/model/entities/ca-lab-front-version.class';
import {HaNewVersionDTO} from '../../../../../ha-core/ha-model/ha-entities/ha-version.class';
import {HaPublicAddVersionDialogComponent} from './ha-public-add-version-dialog/ha-public-add-version-dialog.component';
import {HaNodeDTO} from '../../../../../ha-core/ha-model/ha-entities/ha-node.class';

@Component({
  selector: 'ha-public-versions-page',
  templateUrl: './ha-public-versions-page.component.html',
  styleUrls: ['./ha-public-versions-page.component.scss']
})
export class HaPublicVersionsPageComponent implements OnInit {

  brickVersions: HaBrickVersionDataSource;
  brickId: string;
  displayedColumns: FlTableColumn<CaLabFrontVersion>[] = ['version', 'repoType', 'lastModified'];

  constructor(
    private brickVersionService: HaBrickVersionService,
    private route: ActivatedRoute,
    private brickService: HaBrickService,
    private dialogService: FlDialogService
  ) {
  }

  ngOnInit(): void {
    this.route.parent.url.subscribe(url => {
      this.brickService.getByName(url[0].path).subscribe(brick => {
        this.brickId = brick.id;
        this.setDataSource();
      });
    });
  }

  private setDataSource(): void{
    this.brickVersions = this.brickVersionService.getDataSource(this.brickId);
  }

  private openNewVersionDialog(brickId: string): void {
    const input: FlFormDialogInput<HaNewVersionDTO> = {
      mode: 'create',
      object: {
        version: null,
        repoType: null,
        commit: null,
        brickId: brickId
      } as HaNewVersionDTO
    };

    this.dialogService.openSmallDialog(HaPublicAddVersionDialogComponent, {data: input}).afterClosed().subscribe(
      (res: HaNodeDTO) => {
        if (res != null) {
          this.setDataSource();
        }
      }
    );
  }
}
