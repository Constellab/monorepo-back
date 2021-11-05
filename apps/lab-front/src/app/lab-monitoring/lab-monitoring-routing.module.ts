import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LabMonitoringPageComponent} from './lab-monitoring-page/component/lab-monitoring-page/lab-monitoring-page.component';

const routes: Routes = [
  {path: '', component: LabMonitoringPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabMonitoringRoutingModule {
}
