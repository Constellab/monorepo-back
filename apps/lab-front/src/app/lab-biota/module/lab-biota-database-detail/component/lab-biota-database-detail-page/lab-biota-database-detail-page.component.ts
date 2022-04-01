import {Component, OnInit} from '@angular/core';
import {LabBiotaDataDatasource} from '../../../../model/lab-biota-data.class';
import {LabBiotaDatabase, labBiotaDatabaseGroups} from '../../../../model/lab-biota-database.class';
import {LabBiotaDatabaseService} from '../../../../service/lab-biota-database.service';
import {ActivatedRoute} from '@angular/router';

/**
 * component to show the detail of a biota database
 */
@Component({
  selector: 'lab-biota-database-detail-page',
  templateUrl: './lab-biota-database-detail-page.component.html',
  styleUrls: ['./lab-biota-database-detail-page.component.scss']
})
export class LabBiotaDatabaseDetailPageComponent implements OnInit {

  database: LabBiotaDatabase;

  datasource: LabBiotaDataDatasource;

  columns: string[] = ['id', 'name'];

  constructor(private biotaDatabaseService: LabBiotaDatabaseService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.typingName)
    );
  }

  private init(typingName: string): void {
    this.database = this.findDBFromType(typingName);
    this.datasource = this.biotaDatabaseService.getDatabaseDatasource(typingName);
  }

  // find the DB with the type
  private findDBFromType(type: string): LabBiotaDatabase {
    for (const group of labBiotaDatabaseGroups) {
      const database: LabBiotaDatabase = group.databases.find(d => d.typingName === type);
      if (database != null) {
        return database;
      }
    }
    return null;
  }
}
