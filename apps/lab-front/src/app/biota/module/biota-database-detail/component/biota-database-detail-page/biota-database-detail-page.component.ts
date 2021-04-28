import {Component, OnInit} from '@angular/core';
import {BiotaDataDatasource} from '../../../../model/biota-data.class';
import {BiotaDatabase, biotaDatabaseGroups} from '../../../../model/biota-database.class';
import {BiotaDatabaseService} from '../../../../service/biota-database.service';
import {ActivatedRoute} from '@angular/router';

/**
 * component to show the detail of a biota database
 */
@Component({
  selector: 'gen-biota-database-detail-page',
  templateUrl: './biota-database-detail-page.component.html',
  styleUrls: ['./biota-database-detail-page.component.scss']
})
export class BiotaDatabaseDetailPageComponent implements OnInit {

  database: BiotaDatabase;

  datasource: BiotaDataDatasource;

  columns: string[] = ['id', 'name', 'type'];

  constructor(private biotaDatabaseService: BiotaDatabaseService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.type)
    );
  }

  private init(type: string): void {
    this.database = this.findDBFromType(type);
    this.datasource = this.biotaDatabaseService.getDatabaseDatasource(type);
  }

  // find the DB with the type
  private findDBFromType(type: string): BiotaDatabase {
    for (const group of biotaDatabaseGroups) {
      const database: BiotaDatabase = group.databases.find(d => d.type === type);
      if (database != null) {
        return database;
      }
    }
    return null;
  }
}
