import {Component, Input, OnInit} from '@angular/core';
import {BiotaDatabaseService} from '../../../../service/biota-database.service';
import {BiotaDatabase} from '../../../../model/biota-database.class';

/**
 * Card to display a database and load the database entries count
 */
@Component({
  selector: 'gen-biota-database-card',
  templateUrl: './biota-database-card.component.html',
  styleUrls: ['./biota-database-card.component.scss']
})
export class BiotaDatabaseCardComponent implements OnInit {

  @Input() database: BiotaDatabase;

  databasesEntries: number;

  constructor(private biotaDatabaseService: BiotaDatabaseService) {
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
