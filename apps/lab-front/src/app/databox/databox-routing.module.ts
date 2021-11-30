import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BioxResourceSearchPageComponent} from './module/biox-resource-search-page/component/biox-resource-search-page/biox-resource-search-page.component';

const routes: Routes = [
  {path: '', component: BioxResourceSearchPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataboxRoutingModule {
}
