import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaMyProjectsPageComponent} from './ca-my-projects-page/ca-my-projects-page.component';

const routes: Route[] = [
  {path: '', component: CaMyProjectsPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaMyProjectRoutingModule {
}

