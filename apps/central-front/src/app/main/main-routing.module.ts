import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {MainAppComponent} from './component/main-app/main-app.component';
import {
  constAdminRoute,
  constBaseRoute,
  constDashboardRoute,
  constLabInstancesRoute,
  constLabsConfig,
  constProjectsRoute,
  constProtocolsRoute,
  constSettingsRoute
} from '../core/utils/base-route';
import {LoadUserGuard} from './guard/load-user.guard';
import {AdminGuard} from '../core/guard/admin.guard';

const routes: Route[] = [
  {
    path: '', redirectTo: constBaseRoute, pathMatch: 'full'
  },
  {
    path: constBaseRoute, component: MainAppComponent, canActivate: [LoadUserGuard],
    children: [
      {
        path: '', redirectTo: constDashboardRoute, pathMatch: 'full'
      },
      //////////////////////// DASHBOARD /////////////////////////
      {
        path: constDashboardRoute,
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule)
      },

      //////////////////////// LAB INSTANCE /////////////////////////
      {
        path: constLabInstancesRoute,
        loadChildren: () => import('../lab-instance/lab-instance.module').then(m => m.LabInstanceModule)
      },

      //////////////////////// PROJECTS /////////////////////////
      {
        path: constProjectsRoute,
        loadChildren: () => import('../project/project.module').then(m => m.ProjectModule)
      },

      //////////////////////// LAB /////////////////////////
      {
        path: constLabsConfig,
        loadChildren: () => import('../lab/lab.module').then(m => m.LabModule)
      },
      //////////////////////// PROTOCOL /////////////////////////
      {
        path: constProtocolsRoute,
        loadChildren: () => import('../protocol/protocol.module').then(m => m.ProtocolModule)
      },

      //////////////////////// Admin /////////////////////////
      {
        path: constAdminRoute,
        loadChildren: () => import('../admin/admin.module').then(m => m.AdminModule),
        canActivate: [AdminGuard]
      },

      //////////////////////// SETTINGS /////////////////////////
      {
        path: constSettingsRoute,
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule)
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
export class MainRoutingModule {
}

