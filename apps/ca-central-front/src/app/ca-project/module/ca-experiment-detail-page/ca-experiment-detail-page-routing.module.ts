import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaExperimentDetailPageComponent
} from './component/ca-experiment-detail-page/ca-experiment-detail-page.component';

const routes: Route[] = [
  {path: ':id', component: CaExperimentDetailPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaExperimentDetailPageRoutingModule {
}

