import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {constBaseRoute, constBiotaRoute, constBioxRoute, constFileExplorerRoute} from '../core/utils/base-route';
import {MainAppComponent} from './component/main-app/main-app.component';
import {AutoLoginGuard} from './guard/auto-login.guard';
import {FlLabRoute} from '@monorepo/front-core-lib';
import {LoadLabEnvironmentGuard} from './guard/load-lab-environment.guard';

const routes: Routes = [
  {
    path: '', redirectTo: constBaseRoute, pathMatch: 'full'
  },
  {
    // route to get the token from url and auto-log the user
    // the children : [] is used to make a route without a component because there is a redirection
    path: FlLabRoute.autoLogin.route, canActivate: [AutoLoginGuard], children: [],
  },
  {
    path: constBaseRoute, component: MainAppComponent, canActivate: [LoadLabEnvironmentGuard],
    children: [
      {
        path: '', redirectTo: constBioxRoute, pathMatch: 'full'
      },

      //////////////////////// BIOX  /////////////////////////
      {
        path: constBioxRoute,
        loadChildren: () => import('../biox/biox.module').then(m => m.BioxModule)
      },

      //////////////////////// BIOTA  /////////////////////////
      {
        path: constBiotaRoute,
        loadChildren: () => import('../biota/biota.module').then(m => m.BiotaModule)
      },

      //////////////////////// FILE EXPLORER  /////////////////////////
      {
        path: constFileExplorerRoute,
        loadChildren: () => import('../file-explorer/file-explorer.module').then(m => m.FileExplorerModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {
}
