import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LabViewboxPageComponent} from './module/lab-viewbox-page/component/lab-viewbox-page/lab-viewbox-page.component';
import {
  LabViewConfigDetailPageComponent
} from './module/lab-view-config-detail-page/component/lab-view-config-detail-page/lab-view-config-detail-page.component';

const routes: Routes = [
  {path: '', component: LabViewboxPageComponent},
  {path: 'view-config/:id', component: LabViewConfigDetailPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabViewboxRoutingModule {
}
