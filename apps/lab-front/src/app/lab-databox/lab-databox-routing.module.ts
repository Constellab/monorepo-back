import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  LabResourceSearchPageComponent
} from './module/lab-resource-search-page/component/lab-resource-search-page/lab-resource-search-page.component';

const routes: Routes = [
  {path: '', component: LabResourceSearchPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabDataboxRoutingModule {
}
