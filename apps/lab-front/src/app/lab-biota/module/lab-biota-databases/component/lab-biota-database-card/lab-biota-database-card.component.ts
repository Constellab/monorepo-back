import {Component, Input, OnInit} from '@angular/core';
import {LabBiotaDatabaseService} from '../../../../service/lab-biota-database.service';
import {LabBiotaDatabase} from '../../../../model/lab-biota-database.class';

/**
 * Card to display a database and load the database entries count
 */
@Component({
  selector: 'lab-biota-database-card',
  templateUrl: './lab-biota-database-card.component.html',
  styleUrls: ['./lab-biota-database-card.component.scss']
})
export class LabBiotaDatabaseCardComponent implements OnInit {

  @Input() database: LabBiotaDatabase;

  databasesEntries: number;

  constructor(private biotaDatabaseService: LabBiotaDatabaseService) {
  }

  ngOnInit(): void {
    this.getEntries();
  }

  private getEntries(): void {
    this.biotaDatabaseService.countDatabaseEntries(this.database.typingName).subscribe(
      entries => this.databasesEntries = entries,
      () => this.databasesEntries = 0
    );
  }

}
