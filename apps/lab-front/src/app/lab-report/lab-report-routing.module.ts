import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  LabReportDetailPageComponent
} from './module/lab-report-detail-page/component/lab-report-detail-page/lab-report-detail-page.component';
import {
  LabReportSearchPageComponent
} from './module/lab-report-search-page/component/lab-report-search-page/lab-report-search-page.component';


const routes: Routes = [
  {path: '', component: LabReportSearchPageComponent},
  {path: ':id', component: LabReportDetailPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabReportRoutingModule {
}
