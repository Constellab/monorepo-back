import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';
import {labBiotaDatabaseGroups} from '../../../model/lab-biota-database.class';

/**
 * Component to be placed under a select or autocomplete to list biota database options
 */
@Component({
  selector: 'lab-biota-database-select-options',
  templateUrl: './biota-database-select-options.component.html',
  styleUrls: ['./biota-database-select-options.component.scss']
})
export class BiotaDatabaseSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  databaseGroups = labBiotaDatabaseGroups;

  constructor(@Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
