import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./ha-admin/ha-admin.module').then(m => m.HaAdminModule)
  },
  {
    path: 'bricks',
    loadChildren: () => import('./ha-public/ha-public.module').then(m => m.HaPublicModule)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'bricks'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      // load all lazy module on start
      {
        preloadingStrategy: PreloadAllModules,
        scrollPositionRestoration: 'enabled',
        relativeLinkResolution: 'legacy'
      }
    ),
  ],
  exports: [
    RouterModule
  ]
})
export class HaAppRoutingModule {
}
