import {Component, OnInit} from '@angular/core';
import {LabBiotaDatabaseSearch} from '../../../../model/lab-biota-database.class';
import {LabBiotaDatabaseService} from '../../../../service/lab-biota-database.service';
import {LabBiotaData, LabBiotaDataDatasource} from '../../../../model/lab-biota-data.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {MediaObserver} from '@angular/flex-layout';
import {BiotaDataCardDialogComponent} from '../biota-data-card-dialog/biota-data-card-dialog.component';

@Component({
  selector: 'lab-biota-databases',
  templateUrl: './biota-databases.component.html',
  styleUrls: ['./biota-databases.component.scss']
})
export class BiotaDatabasesComponent implements OnInit {

  biotaDatasource: LabBiotaDataDatasource;
  columns: string[] = ['id', 'name', 'actions'];

  selectedData: LabBiotaData;

  private readonly hideCardScreenSize: string = 'xs';

  constructor(private biotaDatabaseService: LabBiotaDatabaseService,
              private dialogService: FlDialogService,
              private mediaObserver: MediaObserver) {
  }

  ngOnInit(): void {
  }

  onSearch(search: LabBiotaDatabaseSearch): void {
    this.biotaDatasource = this.biotaDatabaseService.searchDatasource(search);
  }

  openDetail(biotaData: LabBiotaData): void {
    this.selectedData = biotaData;
    // if the screen is too small, open detail in dialog
    if (this.mediaObserver.isActive(this.hideCardScreenSize)) {
      this.openDetailDialog(biotaData);
    }
  }

  private openDetailDialog(biotaData: LabBiotaData): void {
    this.dialogService.openMediumDialog(BiotaDataCardDialogComponent, {data: biotaData});
  }
}
