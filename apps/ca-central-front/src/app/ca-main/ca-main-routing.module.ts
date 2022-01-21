import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaMainAppComponent} from './component/ca-main-app/ca-main-app.component';
import {
  caConstAdminRoute,
  caConstBaseRoute,
  caConstDashboardRoute,
  caConstLabInstancesRoute,
  caConstLabsConfig,
  caConstProjectsRoute,
  caConstSettingsRoute,
  caConstSmartDbRoute
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

      //////////////////////// PROJECTS /////////////////////////
      {
        path: caConstProjectsRoute,
        loadChildren: () => import('../ca-project/ca-project.module').then(m => m.CaProjectModule)
      },

      //////////////////////// LAB /////////////////////////
      {
        path: caConstLabsConfig,
        loadChildren: () => import('../ca-lab/ca-lab.module').then(m => m.CaLabModule)
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

