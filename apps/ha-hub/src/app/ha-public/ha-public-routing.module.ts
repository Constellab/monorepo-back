import {NgModule} from '@angular/core';
import {Route, RouterModule, UrlSegment} from '@angular/router';
import {
  HaPublicListBricksPageComponent
} from './module/ha-public-bricks/ha-public-list-bricks-page/ha-public-list-bricks-page.component';
import {
  HaPublicBrickPageComponent
} from './module/ha-public-brick-page/ha-public-brick-page/ha-public-brick-page.component';
import {HaPublicSidenavComponent} from './module/ha-public-brick-page/ha-public-sidenav/ha-public-sidenav.component';
import {HaPublicDocComponent} from './module/ha-public-brick-page/ha-public-doc/ha-public-doc.component';
import {
  HaPublicEditBrickPageComponent
} from './module/ha-public-bricks/ha-public-edit-brick-page/ha-public-edit-brick-page.component';
import {HaPublicVersionsComponent} from './module/ha-public-brick-page/ha-public-versions/ha-public-versions.component';
import {
  HaPublicBrickDescriptionComponent
} from './module/ha-public-brick-page/ha-public-brick-description/ha-public-brick-description.component';
import {HaPublicTechDocComponent} from './module/ha-public-brick-page/ha-public-tech-doc/ha-public-tech-doc.component';


const routes: Route[] = [
  {
    path: '',
    component: HaPublicListBricksPageComponent,
  },
  {
    path: 'edit',
    component: HaPublicEditBrickPageComponent
  },
  {
    component: HaPublicBrickPageComponent,
    matcher: (url: UrlSegment[]) => {
      return url.length >= 2 && (url[1].path.match(/v\d+$/g) || url[1].path.match(/latest/))
        ? {
          consumed: url.slice(0,2),
          posParams: {
            brickName: new UrlSegment(url[0].path, {}),
            version: new UrlSegment(url[1].path, {})
          }
        }
        : null
    },
    children: [
      {
        path: 'doc',
        component: HaPublicSidenavComponent,
        children: [
          {
            path: 'technical-folder/:type/:uniqueName',
            component: HaPublicTechDocComponent
          },
          {
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
