import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  LabExperimentsListPageComponent
} from './module/lab-experiments-page/component/lab-experiments-page-list/lab-experiments-list-page.component';
import {
  LabExperimentDetailPageComponent
} from './module/lab-experiment-detail-page/component/lab-experiment-detail-page/lab-experiment-detail-page.component';
import {
  LabResourceDetailPageComponent
} from './module/lab-resource-detail-page/component/lab-resource-detail-page/lab-resource-detail-page.component';

const routes: Routes = [
  {path: '', component: LabExperimentsListPageComponent},
  {path: 'experiment/:id', component: LabExperimentDetailPageComponent},
  {path: 'resource/:id', component: LabResourceDetailPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabBioxRoutingModule {
}
