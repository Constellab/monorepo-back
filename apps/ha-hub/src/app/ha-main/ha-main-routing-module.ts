import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HaMainComponent} from './ha-main/ha-main.component';
import {Ha404Component} from '../ha-public/module/ha404/ha404.component';
import {HaLoginPageComponent} from './ha-login-page/ha-login-page.component';
import {HaHomeComponent} from './ha-home/ha-home.component';
import {
  HaPublicBrickDescriptionComponent
} from '../ha-public/module/ha-public-brick-page/ha-public-brick-description/ha-public-brick-description.component';
import {
  HaPublicBrickPageComponent
} from '../ha-public/module/ha-public-brick-page/ha-public-brick-page/ha-public-brick-page.component';
import {
  HaPublicTechDocComponent
} from '../ha-public/module/ha-public-brick-page/ha-public-tech-doc/ha-public-tech-doc.component';
import {HaPublicDocComponent} from '../ha-public/module/ha-public-brick-page/ha-public-doc/ha-public-doc.component';
import {
  HaPublicVersionsComponent
} from '../ha-public/module/ha-public-brick-page/ha-public-versions/ha-public-versions.component';

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
    path: 'stories',
    component: HaMainComponent,
    loadChildren: () => import('../ha-story/ha-story.module').then(m => m.HaStoryModule)
  },
  {
    path: 'login',
    component: HaLoginPageComponent,
  },
  {
    path: 'product-doc',
    component: HaMainComponent,
    children: [
      {
        path: '',
        component: HaPublicBrickPageComponent,
        children: [
          {
            path: 'doc',
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
      }
    ]
  },
  {
    path: 'tech-doc',
    component: HaMainComponent,
    children: [
      {
        path: '',
        component: HaPublicBrickPageComponent,
        children: [
          {
            path: 'doc',
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
      }
    ]
  },
  {
    path: '**',
    component: HaMainComponent,
    children: [
      {
        path: '',
        component: HaHomeComponent
      },
      {
        path: '**',
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
