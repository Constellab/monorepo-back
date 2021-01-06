import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {LabInstanceDetailPageComponent} from './component/lab-instance-detail-page/lab-instance-detail-page.component';
import {LabInstanceIframePageComponent} from './component/lab-instance-iframe-page/lab-instance-iframe-page.component';
import {MyLabInstancesPageComponent} from './component/my-lab-instances-page/my-lab-instances-page.component';

const routes: Route[] = [
  {path: '', component: MyLabInstancesPageComponent},
  {path: ':id', component: LabInstanceDetailPageComponent},
  {path: ':id/view', component: LabInstanceIframePageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class LabInstanceRoutingModule {
}

