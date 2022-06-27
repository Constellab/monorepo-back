import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HaMainComponent} from './ha-main/ha-main.component';
import {Ha404Component} from '../ha-public/module/ha404/ha404.component';

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
  {
    path: '**',
    component: HaMainComponent,
    children: [
      {
        path: '',
        component: Ha404Component
      }
    ]
  }
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
