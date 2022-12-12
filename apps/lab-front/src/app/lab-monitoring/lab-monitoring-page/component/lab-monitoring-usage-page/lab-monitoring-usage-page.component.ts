import {Component, OnInit} from '@angular/core';
import {LabMonitorService} from '../../../../lab-core/entity-service/lab-monitor.service';
import {ClDateHelper} from '@monorepo/core-lib';
import {Observable} from 'rxjs';
import {LabMonitorBetweenDates} from '../../../../lab-core/model/entities/lab-monitor.entity';

/**
 * Sub monitoring page to display the CPU, RAM, Disk and Swap usage.
 */
@Component({
  selector: 'lab-monitoring-usage-page',
  templateUrl: './lab-monitoring-usage-page.component.html',
  styleUrls: ['./lab-monitoring-usage-page.component.scss']
})
export class LabMonitoringUsagePageComponent implements OnInit {

  monitor$: Observable<LabMonitorBetweenDates>;

  constructor(private monitorService: LabMonitorService) {
  }

  ngOnInit(): void {
    const fromDate = ClDateHelper.getDate().minus({hour: 1});
    const toDate = ClDateHelper.getDate();
    this.monitor$ = this.monitorService.getMonitor(fromDate, toDate);
  }

}
