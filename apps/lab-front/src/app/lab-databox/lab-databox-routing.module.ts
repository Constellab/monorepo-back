import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  LabResourceSearchPageComponent
} from './module/lab-resource-search-page/component/lab-resource-search-page/lab-resource-search-page.component';
import {
  LabResourceDetailPageComponent
} from './module/lab-resource-detail-page/component/lab-resource-detail-page/lab-resource-detail-page.component';

const routes: Routes = [
  {path: '', component: LabResourceSearchPageComponent},
  {path: 'resource/:id', component: LabResourceDetailPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabDataboxRoutingModule {
}
