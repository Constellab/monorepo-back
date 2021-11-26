import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { DaPublicDocPageComponent } from './module/da-public-doc-page/da-public-doc-page/da-public-doc-page.component';
import {DaPublicSidenavComponent} from './module/da-public-sidenav/da-public-sidenav.component';

const routes: Route[] = [
  {
    path: '',
    component: DaPublicSidenavComponent,
    children: [
      {
        path: '',
        redirectTo: 'intro',
        component: DaPublicDocPageComponent
      },
      {
        path: '**',
        component: DaPublicDocPageComponent
      }
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
export class DaPublicRoutingModule{}
