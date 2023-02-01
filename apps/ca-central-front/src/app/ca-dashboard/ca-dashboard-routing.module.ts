import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaDashboardPageComponent} from './component/ca-dashboard-page/ca-dashboard-page.component';

const routes: Route[] = [
  {path: '', component: CaDashboardPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaDashboardRoutingModule {

}
