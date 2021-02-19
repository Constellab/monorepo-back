import {Component, OnInit} from '@angular/core';
import {BiotaDatabaseGroup, biotaDatabaseGroups} from '../../../../model/biota-database.class';

@Component({
  selector: 'gen-biota-databases',
  templateUrl: './biota-databases.component.html',
  styleUrls: ['./biota-databases.component.scss']
})
export class BiotaDatabasesComponent implements OnInit {

  databasesGroups: BiotaDatabaseGroup[] = biotaDatabaseGroups;

  constructor() {
  }

  ngOnInit(): void {
  }

}
