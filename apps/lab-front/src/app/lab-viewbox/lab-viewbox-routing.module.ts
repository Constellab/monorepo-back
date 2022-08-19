import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LabViewboxPageComponent} from './module/lab-viewbox-page/component/lab-viewbox-page/lab-viewbox-page.component';

const routes: Routes = [
  {path: '', component: LabViewboxPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabViewboxRoutingModule {
}
