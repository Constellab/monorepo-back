import {Component, OnInit} from '@angular/core';
import {BiotaDatabaseSearch} from '../../../../model/biota-database.class';
import {BiotaDatabaseService} from '../../../../service/biota-database.service';
import {BiotaData, BiotaDataDatasource} from '../../../../model/biota-data.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {MediaObserver} from '@angular/flex-layout';
import {BiotaDataCardDialogComponent} from '../biota-data-card-dialog/biota-data-card-dialog.component';

@Component({
  selector: 'gen-biota-databases',
  templateUrl: './biota-databases.component.html',
  styleUrls: ['./biota-databases.component.scss']
})
export class BiotaDatabasesComponent implements OnInit {

  biotaDatasource: BiotaDataDatasource;
  columns: string[] = ['id', 'name', 'actions'];

  selectedData: BiotaData;

  private readonly hideCardScreenSize: string = 'xs';

  constructor(private biotaDatabaseService: BiotaDatabaseService,
              private dialogService: FlDialogService,
              private mediaObserver: MediaObserver) {
  }

  ngOnInit(): void {
  }

  onSearch(search: BiotaDatabaseSearch): void {
    this.biotaDatasource = this.biotaDatabaseService.searchDatasource(search);
  }

  openDetail(biotaData: BiotaData): void {
    this.selectedData = biotaData;
    // if the screen is too small, open detail in dialog
    if (this.mediaObserver.isActive(this.hideCardScreenSize)) {
      this.openDetailDialog(biotaData);
    }
  }

  private openDetailDialog(biotaData: BiotaData): void {
    this.dialogService.openMediumDialog(BiotaDataCardDialogComponent, {data: biotaData});
  }
}
