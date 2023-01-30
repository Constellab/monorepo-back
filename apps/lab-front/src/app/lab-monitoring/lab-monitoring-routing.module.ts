import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  LabMonitoringPageComponent
} from './lab-monitoring-page/component/lab-monitoring-page/lab-monitoring-page.component';
import {
  LabMonitoringDashboardPageComponent
} from './lab-monitoring-page/component/lab-monitoring-dashboard-page/lab-monitoring-dashboard-page.component';
import {
  LabMonitoringVenvsPageComponent
} from './lab-monitoring-page/component/lab-monitoring-venvs-page/lab-monitoring-venvs-page.component';
import {
  LabMonitoringLogsPageComponent
} from './lab-monitoring-page/component/lab-monitoring-logs-page/lab-monitoring-logs-page.component';
import {
  LabMonitoringUsagePageComponent
} from './lab-monitoring-page/component/lab-monitoring-usage-page/lab-monitoring-usage-page.component';
import {
  LabMonitoringShareLinksPageComponent
} from './lab-monitoring-page/component/lab-monitoring-share-links-page/lab-monitoring-share-links-page.component';
import {
  LabMonitoringBrickDataPageComponent
} from './lab-monitoring-page/component/lab-monitoring-brick-data-page/lab-monitoring-brick-data-page.component';

const routes: Routes = [
  {
    path: '', component: LabMonitoringPageComponent, children: [
      {path: '', component: LabMonitoringDashboardPageComponent},
      {path: 'usage', component: LabMonitoringUsagePageComponent},
      {path: 'venvs', component: LabMonitoringVenvsPageComponent},
      {path: 'bricks-data', component: LabMonitoringBrickDataPageComponent},
      {path: 'logs', component: LabMonitoringLogsPageComponent},
      {path: 'share-links', component: LabMonitoringShareLinksPageComponent}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabMonitoringRoutingModule {
}
