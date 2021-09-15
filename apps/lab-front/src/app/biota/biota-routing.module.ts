import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BiotaDatabasesComponent} from './module/biota-databases/component/biota-databases/biota-databases.component';
import {BiotaDatabaseDetailPageComponent} from './module/biota-database-detail/component/biota-database-detail-page/biota-database-detail-page.component';

const routes: Routes = [
  {path: '', component: BiotaDatabasesComponent},
  {path: 'database/:typingName', component: BiotaDatabaseDetailPageComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BiotaRoutingModule {
}
