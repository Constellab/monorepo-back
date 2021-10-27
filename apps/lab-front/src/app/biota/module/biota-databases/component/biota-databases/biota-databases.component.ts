import {Component, OnInit} from '@angular/core';
import {BiotaDatabaseGroup, biotaDatabaseGroups, BiotaDatabaseSearch} from '../../../../model/biota-database.class';
import {BiotaDatabaseService} from '../../../../service/biota-database.service';
import {BiotaDataDatasource} from '../../../../model/biota-data.class';

@Component({
  selector: 'gen-biota-databases',
  templateUrl: './biota-databases.component.html',
  styleUrls: ['./biota-databases.component.scss']
})
export class BiotaDatabasesComponent implements OnInit {

  databasesGroups: BiotaDatabaseGroup[] = biotaDatabaseGroups;

  biotaDatasource: BiotaDataDatasource;
  columns: string[] = ['id', 'name', 'actions'];

  constructor(private biotaDatabaseService: BiotaDatabaseService) {
  }

  ngOnInit(): void {
  }

  onSearch(search: BiotaDatabaseSearch): void {
    this.biotaDatasource = this.biotaDatabaseService.searchDatasource(search);
  }
}
