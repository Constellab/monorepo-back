import {Component, Input, OnInit} from '@angular/core';
import {
  FlArrayObs,
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlFormDialogInput,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {CaLabFrontVersion, CaSaveLabFrontVersionDTO} from '../../../../model/entities/ca-lab-front-version.class';
import {
  CaLabFrontVersionFormDialogComponent
} from '../ca-lab-front-version-form-dialog/ca-lab-front-version-form-dialog.component';
import {CaLabFrontVersionService} from '../../../../service-api/ca-lab-front-version.service';

@Component({
  selector: 'ca-lab-front-version-table',
  templateUrl: './ca-lab-front-version-table.component.html',
  styleUrls: ['./ca-lab-front-version-table.component.scss']
})
export class CaLabFrontVersionTableComponent extends FlTableAbstractDirective<CaLabFrontVersion>
  implements OnInit {

  @Input() datasource: FlArrayObs<CaLabFrontVersion>;

  constructor(private dialogService: FlDialogService,
              private labFrontVersionService: CaLabFrontVersionService) {
    super(['actions', 'gwsCoreBrickVersion', 'lastModified']);
  }

  ngOnInit(): void {
  }

  updateVersion(frontVersion: CaLabFrontVersion): void {
    const versionDTO: CaSaveLabFrontVersionDTO = {
      id: frontVersion.id,
      version: frontVersion.version,
      gwsCoreBrickVersion: frontVersion.gwsCoreBrickVersion
    };

    const input: FlFormDialogInput = {
      mode: 'update',
      object: versionDTO
    };

    this.dialogService.openSmallDialog(CaLabFrontVersionFormDialogComponent, {data: input}).afterClosed().subscribe(
      result => this.onUpdateClosed(result)
    );
  }

  private onUpdateClosed(frontVersion?: CaLabFrontVersion): void {
    if (frontVersion) {
      this.datasource.updateItem(frontVersion);
    }
  }

  deleteVersion(frontVersion: CaLabFrontVersion): void {
    const input: FlConfirmDialogInput = {
      title: 'delete_lab_front_version',
      content: 'delete_lab_front_version_confirmation',
      translateTitleAndContent: true,
      observable: this.labFrontVersionService.delete(frontVersion.id),
      successMessage: 'lab_front_version_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, frontVersion)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult, frontVersion: CaLabFrontVersion): void {
    if (result.choice) {
      this.datasource.removeItem(frontVersion);
    }
  }

}
