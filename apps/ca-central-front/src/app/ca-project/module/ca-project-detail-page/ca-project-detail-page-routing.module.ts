import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaProjectDetailPageComponent} from './component/ca-project-detail-page/ca-project-detail-page.component';

const routes: Route[] = [
  {path: ':id', component: CaProjectDetailPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaProjectDetailPageRoutingModule {
}

