import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  labConstBaseRoute,
  labConstBiotaRoute,
  labConstBioxRoute,
  labConstDataboxRoute,
  labConstDocRoute,
  labConstMonitoringRoute,
  labConstReportRoute
} from '../lab-core/utils/lab-base-route';
import {LabMainAppComponent} from './component/lab-main-app/lab-main-app.component';
import {LabAutoLoginGuard} from './guard/lab-auto-login.guard';
import {FlLabRoute} from '@monorepo/front-core-lib';
import {LabLoadEnvironmentGuard} from './guard/lab-load-environment.guard';

const routes: Routes = [
  {
    path: '', redirectTo: 'login', pathMatch: 'full'
  },
  {
    // route to get the token from url and auto-log the user
    // the children : [] is used to make a route without a component because there is a redirection
    path: FlLabRoute.autoLogin.route, canActivate: [LabAutoLoginGuard], children: [],
  },
  {
    path: labConstBaseRoute, component: LabMainAppComponent, canActivate: [LabLoadEnvironmentGuard],
    children: [
      {
        path: '', redirectTo: labConstBioxRoute, pathMatch: 'full'
      },

      ////////////////////////  BIOX  /////////////////////////
      {
        path: labConstBioxRoute,
        loadChildren: () => import('../lab-biox/lab-biox.module').then(m => m.LabBioxModule)
      },

      ////////////////////////  BIOTA  /////////////////////////
      {
        path: labConstBiotaRoute,
        loadChildren: () => import('../lab-biota/lab-biota.module').then(m => m.LabBiotaModule)
      },

      ////////////////////////  DATABOX  /////////////////////////
      {
        path: labConstDataboxRoute,
        loadChildren: () => import('../lab-databox/lab-databox.module').then(m => m.LabDataboxModule)
      },
      ////////////////////////  REPORT  /////////////////////////
      {
        path: labConstReportRoute,
        loadChildren: () => import('../lab-report/lab-report.module').then(m => m.LabReportModule)
      },
      ////////////////////////  DOC  /////////////////////////
      {
        path: labConstDocRoute,
        loadChildren: () => import('../lab-doc/lab-doc.module').then(m => m.LabDocModule)
      },
      //////////////////////// MONITORING  /////////////////////////
      {
        path: labConstMonitoringRoute,
        loadChildren: () => import('../lab-monitoring/lab-monitoring.module').then(m => m.LabMonitoringModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabMainRoutingModule {
}
