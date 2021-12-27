import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  LabExperimentsListPageComponent
} from './module/lab-experiments-page/component/lab-experiments-page-list/lab-experiments-list-page.component';
import {
  LabExperimentDetailPageComponent
} from './module/lab-experiment-detail-page/component/lab-experiment-detail-page/lab-experiment-detail-page.component';

const routes: Routes = [
  {path: '', component: LabExperimentsListPageComponent},
  {path: 'experiment/:id', component: LabExperimentDetailPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabBioxRoutingModule {
}
