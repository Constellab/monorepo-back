import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {DaPublicBrickPageComponent} from './da-public-brick-page/da-public-brick-page.component';


const routes: Route[] = [
  {
    path: '',
    component: DaPublicBrickPageComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class DaPublicBrickPageRoutingModule {
}
