import {Component, OnInit} from '@angular/core';
import {
  CaLabFrontVersion,
  CaLabFrontVersionDatasource
} from '../../../ca-core/model/entities/ca-lab-front-version.class';
import {CaLabFrontVersionService} from '../../../ca-core/service-api/ca-lab-front-version.service';
import {FlDialogService, FlFormDialogInput, FlTableColumn} from '@monorepo/front-core-lib';
import {
  CaLabFrontVersionFormDialogComponent
} from '../../../ca-core/entity-module/ca-lab-front-version-core/component/ca-lab-front-version-form-dialog/ca-lab-front-version-form-dialog.component';

@Component({
  selector: 'ca-admin-lab-front-version-list',
  templateUrl: './ca-admin-lab-front-version-list.component.html',
  styleUrls: ['./ca-admin-lab-front-version-list.component.scss']
})
export class CaAdminLabFrontVersionListComponent implements OnInit {

  frontVersions: CaLabFrontVersionDatasource;

  displayedColumns: FlTableColumn<CaLabFrontVersion>[] = ['version', 'gwsCoreBrickVersion', 'lastModified', 'actions'];

  constructor(private labFrontVersionService: CaLabFrontVersionService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.frontVersions = this.labFrontVersionService.getAllDatasource();
  }

  createVersion(): void {
    const input: FlFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaLabFrontVersionFormDialogComponent, {data: input}).afterClosed().subscribe(
      version => this.onCreateClosed(version)
    );
  }

  private onCreateClosed(version?: CaLabFrontVersion): void {
    if (version) {
      this.frontVersions.addItem(version, () => true);
    }
  }

  loadMoreResults(): void {
    this.frontVersions.getNextPage();
  }

}
