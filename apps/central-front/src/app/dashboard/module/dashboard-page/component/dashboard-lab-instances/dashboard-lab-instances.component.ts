import {Component, OnInit} from '@angular/core';
import {LabInstanceService} from '../../../../../core/service-api/lab-instance.service';
import {LabInstanceDatasource} from '../../../../../core/model/entities/lab-instance.class';
import {RouterService} from '../../../../../core/service/router.service';

/**
 * Small list of lab instances in the dashboard
 */
@Component({
  selector: 'gen-dashboard-lab-instances',
  templateUrl: './dashboard-lab-instances.component.html',
  styleUrls: ['./dashboard-lab-instances.component.scss']
})
export class DashboardLabInstancesComponent implements OnInit {

  labInstancesDatasource: LabInstanceDatasource;

  myLabInstancesRoute: string = RouterService.getMyLabInstancesRoute();

  constructor(private labInstanceService: LabInstanceService) {
  }

  ngOnInit(): void {
    this.getMyLabInstances();
  }

  private getMyLabInstances(): void {
    this.labInstancesDatasource = this.labInstanceService.getDashboardCurrentLabInstancesDatasource();
  }

}
