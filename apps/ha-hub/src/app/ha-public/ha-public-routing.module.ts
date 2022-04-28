import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {HaPublicListBricksPageComponent} from './module/ha-public-bricks/ha-public-list-bricks-page/ha-public-list-bricks-page.component';
import {HaPublicBrickPageComponent}
  from './module/ha-public-brick-page/ha-public-brick-page/ha-public-brick-page.component';
import {HaPublicSidenavComponent} from './module/ha-public-brick-page/ha-public-sidenav/ha-public-sidenav.component';
import {HaPublicDocComponent} from './module/ha-public-brick-page/ha-public-doc/ha-public-doc.component';
import {HaPublicEditBrickPageComponent} from './module/ha-public-bricks/ha-public-edit-brick-page/ha-public-edit-brick-page.component';
import {HaPublicVersionsComponent} from './module/ha-public-brick-page/ha-public-versions/ha-public-versions.component';
import {HaPublicBrickDescriptionComponent} from './module/ha-public-brick-page/ha-public-brick-description/ha-public-brick-description.component';



const routes: Route[] = [
  {
    path: '',
    component: HaPublicListBricksPageComponent,
  },
  {
    path: 'edit',
    component: HaPublicEditBrickPageComponent
  },
  // {
  //   path: ':brickName/:brickVersion',
  //   component: HaPublicBrickPageComponent,
  //   children: [
  //     {
  //       path: 'doc',
  //       component: HaPublicBrickPageComponent,
  //       children: [{
  //         path: '**',
  //         component: HaPublicBrickPageComponent
  //       }]
  //     }
  //   ]
  // },
  {
    path: ':brickName/:version',
    component: HaPublicBrickPageComponent,
    children: [
      {
        path: 'doc',
        component: HaPublicSidenavComponent,
        children: [{
          path: '**',
          component: HaPublicDocComponent
        }]
      },
      {
        path: 'version',
        component: HaPublicVersionsComponent,
      },
      {
        path: '',
        component: HaPublicBrickDescriptionComponent
      }
    ]
  },
  {
    path: ':brickName',
    redirectTo: ':brickName/latest'
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
export class HaPublicRoutingModule {
}
