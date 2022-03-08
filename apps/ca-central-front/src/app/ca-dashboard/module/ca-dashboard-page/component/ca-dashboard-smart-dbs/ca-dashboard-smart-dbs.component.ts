import {Component, OnInit} from '@angular/core';
import {CaSmartDbDatasource} from '../../../../../ca-core/model/entities/ca-smart-db.entity';
import {CaSmartDbService} from '../../../../../ca-core/service-api/ca-smart-db.service';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';

/**
 * Component to list the current smart dbs of the user
 */
@Component({
  selector: 'ca-dashboard-smart-dbs',
  templateUrl: './ca-dashboard-smart-dbs.component.html',
  styleUrls: ['./ca-dashboard-smart-dbs.component.scss']
})
export class CaDashboardSmartDbsComponent implements OnInit {

  smartDb$: CaSmartDbDatasource;

  mySmartDbsRoute: string = CaRouterService.getMySmartDbsRoute();

  constructor(private smartDbService: CaSmartDbService) {
  }

  ngOnInit(): void {
    this.smartDb$ = this.smartDbService.getCurrentSmartDbsDatasource(4);
  }

}
