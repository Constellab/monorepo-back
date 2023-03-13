import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/biox',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      // load all lazy module on start
      // load all lazy module on start
{
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
    initialNavigation: 'enabledBlocking'
}
    ),
  ],
  exports: [RouterModule],
})
export class LabAppRoutingModule {}
