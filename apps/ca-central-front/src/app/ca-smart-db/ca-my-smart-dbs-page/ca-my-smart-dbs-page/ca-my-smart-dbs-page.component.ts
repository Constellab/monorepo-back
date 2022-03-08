import {Component, OnInit} from '@angular/core';
import {CaSmartDbDatasource} from '../../../ca-core/model/entities/ca-smart-db.entity';
import {CaSmartDbService} from '../../../ca-core/service-api/ca-smart-db.service';

/**
 * Page to list the smart dbs of the user
 */
@Component({
  selector: 'ca-my-smart-dbs-page',
  templateUrl: './ca-my-smart-dbs-page.component.html',
  styleUrls: ['./ca-my-smart-dbs-page.component.scss']
})
export class CaMySmartDbsPageComponent implements OnInit {

  smartDbs$: CaSmartDbDatasource;

  constructor(private smartDbService: CaSmartDbService) {
  }

  ngOnInit(): void {
    this.smartDbs$ = this.smartDbService.getCurrentSmartDbsDatasource(20);
  }

}
