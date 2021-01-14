import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {constBaseRoute, constBiotaRoute, constBioxRoute} from '../core/utils/base-route';
import {MainAppComponent} from './component/main-app/main-app.component';

const routes: Routes = [
  {
    path: '', redirectTo: constBaseRoute, pathMatch: 'full'
  },
  {
    path: constBaseRoute, component: MainAppComponent, canActivate: [],
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
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {
}
