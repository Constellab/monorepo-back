import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./ha-main/ha-main.module').then(m => m.HaMainModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      // load all lazy module on start
      {
        preloadingStrategy: PreloadAllModules,
        scrollPositionRestoration: 'enabled',
        relativeLinkResolution: 'legacy',
        paramsInheritanceStrategy: 'always'
      }
    ),
  ],
  exports: [
    RouterModule
  ]
})
export class HaAppRoutingModule {
}
