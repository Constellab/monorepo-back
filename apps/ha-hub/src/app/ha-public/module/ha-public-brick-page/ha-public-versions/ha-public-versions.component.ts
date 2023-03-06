import {Component, OnInit} from '@angular/core';
import {
  HaBrickVersion,
  HaBrickVersionDataSource
} from '../../../../ha-core/ha-model/ha-entities/ha-brick-version.class';
import {HaBrickVersionService} from '../../../../ha-core/ha-service/ha-brick-version.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {FlDialogService, FlFormDialogInput, FlTableColumn} from '@monorepo/front-core-lib';
import {HaNewVersionDTO} from '../../../../ha-core/ha-model/ha-entities/ha-version.class';
import {
  HaPublicAddVersionDialogComponent
} from '../ha-public-add-version-dialog/ha-public-add-version-dialog.component';
import {HaNodeDTO} from '../../../../ha-core/ha-model/ha-entities/ha-node.class';

@Component({
  selector: 'ha-public-versions-page',
  templateUrl: './ha-public-versions.component.html',
  styleUrls: ['./ha-public-versions.component.scss']
})
export class HaPublicVersionsComponent implements OnInit {

  brickVersions: HaBrickVersionDataSource;
  brickId: string;
  displayedColumns: FlTableColumn<HaBrickVersion>[] = ['version', 'repoType', 'lastModified', 'informations'];

  constructor(
    private brickVersionService: HaBrickVersionService,
    private route: ActivatedRoute,
    private brickService: HaBrickService,
    private dialogService: FlDialogService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    if (this.router.url.includes('tech-doc') || this.router.url.includes('product-doc')) {
      this.init(this.router.url.includes('tech-doc') ? 'gws_core' : 'gws_academy');
    } else {
      this.route.parent.url.subscribe(url => {
        this.init(url[0].path);
      });
    }
  }

  private init(brickName: string): void {
    this.brickService.getByName(brickName).subscribe(brick => {
      this.brickId = brick.id;
      this.setDataSource();
    });
  }

  openNewVersionDialog(brickId: string): void {
    const input: FlFormDialogInput<HaNewVersionDTO> = {
      mode: 'create',
      object: {
        version: null,
        repoType: null,
        commit: null,
        brickId: brickId,
        subPatch: null,
        isBeta: false
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

  private setDataSource(): void {
    this.brickVersions = this.brickVersionService.getDataSource(this.brickId);
  }
}
