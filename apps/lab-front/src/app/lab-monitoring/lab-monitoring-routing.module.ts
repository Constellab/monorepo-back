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

const routes: Routes = [
  {
    path: '', component: LabMonitoringPageComponent, children: [
      {path: '', component: LabMonitoringDashboardPageComponent},
      {path: 'venvs', component: LabMonitoringVenvsPageComponent}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabMonitoringRoutingModule {
}
