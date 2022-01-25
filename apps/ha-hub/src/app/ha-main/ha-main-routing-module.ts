import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {HaMainComponent} from './ha-main.component';

const routes: Routes = [
  {
    path: 'admin',
    component: HaMainComponent,
    loadChildren: () => import('../ha-admin/ha-admin.module').then(m => m.HaAdminModule)
  },
  {
    path: 'bricks',
    component: HaMainComponent,
    loadChildren: () => import('../ha-public/ha-public.module').then(m => m.HaPublicModule)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'bricks'
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class HaMainRoutingModule {
}
