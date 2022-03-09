import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {HaPublicListBricksPageComponent} from './module/ha-public-bricks/ha-public-list-bricks-page/ha-public-list-bricks-page.component';
import {HaPublicBrickPageComponent}
  from './module/ha-public-bricks/ha-public-brick-page/ha-public-brick-page/ha-public-brick-page.component';
import {HaPublicSidenavComponent} from './module/ha-public-bricks/ha-public-brick-page/ha-public-sidenav/ha-public-sidenav.component';
import {HaPublicDocPageComponent} from './module/ha-public-bricks/ha-public-brick-page/ha-public-doc-page/ha-public-doc-page/ha-public-doc-page.component';
import {HaPublicEditBrickPageComponent} from './module/ha-public-bricks/ha-public-list-bricks-page/ha-public-edit-brick-page/ha-public-edit-brick-page.component';
import {HaPublicVersionsPageComponent} from './module/ha-public-bricks/ha-public-brick-page/ha-public-versions-page/ha-public-versions-page.component';
import {HaPublicBrickDescriptionPageComponent} from './module/ha-public-bricks/ha-public-brick-page/ha-public-brick-description-page/ha-public-brick-description-page.component';



const routes: Route[] = [
  // {
  //   path: 'docs',
  //   component: HaPublicSidenavComponent,
  //   children: [
  //     {
  //       path: '**',
  //       component: HaPublicDocPageComponent
  //     }
  //   ]
  // },
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
          component: HaPublicDocPageComponent
        }]
      },
      {
        path: 'version',
        component: HaPublicVersionsPageComponent,
      },
      {
        path: '',
        component: HaPublicBrickDescriptionPageComponent
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
