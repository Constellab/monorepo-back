import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaReportDetailPageComponent} from './component/ca-report-detail-page/ca-report-detail-page.component';

const routes: Route[] = [
  {path: ':id', component: CaReportDetailPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaReportDetailPageRoutingModule {
}

