import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BioxExperimentsListPageComponent} from './module/biox-experiments-page/component/biox-experiments-page-list/biox-experiments-list-page.component';
import {BioxExperimentDetailPageComponent} from './module/biox-experiment-detail-page/component/biox-experiment-detail-page/biox-experiment-detail-page.component';
import {BioxResourceDetailPageComponent} from './module/biox-resource-detail-page/component/biox-resource-detail-page/biox-resource-detail-page.component';

const routes: Routes = [
  {path: '', component: BioxExperimentsListPageComponent},
  {path: 'experiment/:id', component: BioxExperimentDetailPageComponent},
  {path: 'resource/:id', component: BioxResourceDetailPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BioxRoutingModule {
}
