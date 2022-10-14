import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaMainAppComponent} from './component/ca-main-app/ca-main-app.component';
import {
  caConstAdminRoute,
  caConstBaseRoute,
  caConstDashboardRoute,
  caConstExperimentRoute,
  caConstLabInstancesRoute,
  caConstMyProjectsRoute,
  caConstProjectRoute,
  caConstReportRoute,
  caConstSettingsRoute,
  caConstSmartDbRoute,
  caConstStructureRoute
} from '../ca-core/utils/ca-base-route';
import {CaLoadUserGuard} from './guard/ca-load-user.guard';
import {CaAdminGuard} from '../ca-core/guard/ca-admin-guard.service';

const routes: Route[] = [
  {
    path: '', redirectTo: caConstBaseRoute, pathMatch: 'full'
  },
  {
    path: caConstBaseRoute, component: CaMainAppComponent, canActivate: [CaLoadUserGuard],
    children: [
      {
        path: '', redirectTo: caConstDashboardRoute, pathMatch: 'full'
      },
      //////////////////////// DASHBOARD /////////////////////////
      {
        path: caConstDashboardRoute,
        loadChildren: () => import('../ca-dashboard/ca-dashboard.module').then(m => m.CaDashboardModule)
      },

      //////////////////////// LAB INSTANCE /////////////////////////
      {
        path: caConstLabInstancesRoute,
        loadChildren: () => import('../ca-lab-instance/ca-lab-instance.module').then(m => m.CaLabInstanceModule)
      },

      //////////////////////// MY PROJECT /////////////////////////
      {
        path: caConstMyProjectsRoute,
        loadChildren: () => import('../ca-project/module/ca-my-projects/ca-my-project.module').then(m => m.CaMyProjectModule)
      },

      //////////////////////// PROJECT DETAIL /////////////////////////
      {
        path: caConstProjectRoute,
        loadChildren: () => import('../ca-project/module/ca-project-detail-page/ca-project-detail-page.module')
          .then(m => m.CaProjectDetailPageModule)
      },

      //////////////////////// EXPERIMENT DETAIL /////////////////////////
      {
        path: caConstExperimentRoute,
        loadChildren: () => import('../ca-project/module/ca-experiment-detail-page/ca-experiment-detail-page.module')
          .then(m => m.CaExperimentDetailPageModule)
      },

      //////////////////////// REPORT DETAIL /////////////////////////
      {
        path: caConstReportRoute,
        loadChildren: () => import('../ca-project/module/ca-report-detail-page/ca-report-detail-page.module')
          .then(m => m.CaReportDetailPageModule)
      },

      //////////////////////// SMART DB /////////////////////////
      {
        path: caConstSmartDbRoute,
        loadChildren: () => import('../ca-smart-db/ca-smart-db.module').then(m => m.CaSmartDbModule)
      },
      //////////////////////// Admin /////////////////////////
      {
        path: caConstAdminRoute,
        loadChildren: () => import('../ca-admin/ca-admin.module').then(m => m.CaAdminModule),
        canActivate: [CaAdminGuard]
      },
      //////////////////////// STRUCTURE /////////////////////////
      {
        path: caConstStructureRoute,
        loadChildren: () => import('../ca-structure/ca-structure.module').then(m => m.CaStructureModule),
      },

      //////////////////////// SETTINGS /////////////////////////
      {
        path: caConstSettingsRoute,
        loadChildren: () => import('../ca-settings/ca-settings.module').then(m => m.CaSettingsModule)
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaMainRoutingModule {
}

