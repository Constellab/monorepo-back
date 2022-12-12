import {Component, OnInit} from '@angular/core';
import {LabRouterService} from '../../../../lab-core/service/lab-router.service';

@Component({
  selector: 'lab-monitoring-page',
  templateUrl: './lab-monitoring-page.component.html',
  styleUrls: ['./lab-monitoring-page.component.scss']
})
export class LabMonitoringPageComponent implements OnInit {

  monitoringRoute = LabRouterService.getMonitoringRoute();

  monitoringUsageRoute = LabRouterService.getMonitoringUsageRoute();

  monitoringVenvsRoute = LabRouterService.getMonitoringVenvsRoute();
  monitoringLogsRoute = LabRouterService.getMonitoringLogsRoute();

  constructor() {
  }

  ngOnInit(): void {
  }

}
