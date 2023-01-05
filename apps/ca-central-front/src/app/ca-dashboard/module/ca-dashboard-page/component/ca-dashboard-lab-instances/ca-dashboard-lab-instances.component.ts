import {Component, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../../../ca-core/service-api/ca-lab-instance.service';
import {CaLabInstanceDatasource} from '../../../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';
import {CaDashboardListLayoutComponent} from '../ca-dashboard-list-layout/ca-dashboard-list-layout.component';

/**
 * Small list of lab instances in the dashboard
 */
@Component({
  selector: 'ca-dashboard-lab-instances',
  templateUrl: './ca-dashboard-lab-instances.component.html',
  styleUrls: ['./ca-dashboard-lab-instances.component.scss']
})
export class CaDashboardLabInstancesComponent implements OnInit {

  labInstancesDatasource: CaLabInstanceDatasource;

  myLabInstancesRoute: string = CaRouterService.getMyLabInstancesRoute();

  constructor(private labInstanceService: CaLabInstanceService) {
  }

  ngOnInit(): void {
    this.getMyLabInstances();
  }

  private getMyLabInstances(): void {
    this.labInstancesDatasource = this.labInstanceService.getCurrentLabInstancesDatasource(CaDashboardListLayoutComponent.maxItems);
  }

}
