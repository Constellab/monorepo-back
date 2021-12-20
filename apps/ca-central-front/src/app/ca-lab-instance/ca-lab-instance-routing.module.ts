import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaLabInstanceDetailPageComponent
} from './component/ca-lab-instance-detail-page/ca-lab-instance-detail-page.component';
import {
  CaLabInstanceIframePageComponent
} from './component/ca-lab-instance-iframe-page/ca-lab-instance-iframe-page.component';
import {CaMyLabInstancesPageComponent} from './component/ca-my-lab-instances-page/ca-my-lab-instances-page.component';

const routes: Route[] = [
  {path: '', component: CaMyLabInstancesPageComponent},
  {path: ':id', component: CaLabInstanceDetailPageComponent},
  {path: ':id/view', component: CaLabInstanceIframePageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaLabInstanceRoutingModule {
}

