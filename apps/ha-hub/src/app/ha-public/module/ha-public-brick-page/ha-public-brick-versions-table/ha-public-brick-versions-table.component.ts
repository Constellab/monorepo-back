import {Component, OnInit} from '@angular/core';
import {FlDialogService, FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {HaBrickVersion} from '../../../../ha-core/ha-model/ha-entities/ha-brick-version.class';
import {
  HaPublicBrickVersionDetailDialogComponent
} from '../ha-public-brick-version-detail-dialog/ha-public-brick-version-detail-dialog.component';

@Component({
  selector: 'ha-public-brick-versions-table',
  templateUrl: './ha-public-brick-versions-table.component.html',
  styleUrls: ['./ha-public-brick-versions-table.component.scss']
})
export class HaPublicBrickVersionsTableComponent extends FlTableAbstractDirective<HaBrickVersion> implements OnInit {

  constructor(
    private dialogService: FlDialogService
  ) {
    super();
  }

  ngOnInit(): void {
  }

  openBrickVersionDetail(bv: HaBrickVersion): void {
    this.dialogService.openMediumDialog(HaPublicBrickVersionDetailDialogComponent, {data: bv});
  }

}
