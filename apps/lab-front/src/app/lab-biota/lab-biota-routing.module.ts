import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  LabBiotaDatabasesComponent
} from './module/lab-biota-databases/component/lab-biota-databases/lab-biota-databases.component';
import {
  LabBiotaDatabaseDetailPageComponent
} from './module/lab-biota-database-detail/component/lab-biota-database-detail-page/lab-biota-database-detail-page.component';

const routes: Routes = [
  {path: '', component: LabBiotaDatabasesComponent},
  {path: 'database/:typingName', component: LabBiotaDatabaseDetailPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabBiotaRoutingModule {
}
