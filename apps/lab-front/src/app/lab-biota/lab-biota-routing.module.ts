import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  BiotaDatabasesComponent
} from './module/lab-biota-databases/component/biota-databases/biota-databases.component';
import {
  BiotaDatabaseDetailPageComponent
} from './module/lab-biota-database-detail/component/biota-database-detail-page/biota-database-detail-page.component';

const routes: Routes = [
  {path: '', component: BiotaDatabasesComponent},
  {path: 'database/:typingName', component: BiotaDatabaseDetailPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabBiotaRoutingModule {
}
