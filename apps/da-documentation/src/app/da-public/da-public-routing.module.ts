import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {DaPublicListBricksPageComponent} from './module/da-public-bricks/da-public-list-bricks-page/da-public-list-bricks-page.component';
import {DaPublicBrickPageComponent}
  from './module/da-public-bricks/da-public-brick-page/da-public-brick-page/da-public-brick-page.component';



const routes: Route[] = [
  // {
  //   path: 'docs',
  //   component: DaPublicSidenavComponent,
  //   children: [
  //     {
  //       path: '**',
  //       component: DaPublicDocPageComponent
  //     }
  //   ]
  // },
  {
    path: '',
    component: DaPublicListBricksPageComponent,
  },
  {
    path: '**',
    component: DaPublicBrickPageComponent
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
export class DaPublicRoutingModule {
}
