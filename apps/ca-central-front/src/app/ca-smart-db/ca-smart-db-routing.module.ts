import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaSmartDbSearchPageComponent
} from './ca-smart-db-search-page/component/ca-smart-db-search-page/ca-smart-db-search-page.component';
import {
  CaSmartDbDocPageComponent
} from './ca-smart-db-doc-page/component/ca-smart-db-doc-page/ca-smart-db-doc-page.component';
import {
  CaSmartDbAdminPageComponent
} from './ca-smart-db-admin-page/component/ca-smart-db-admin-page/ca-smart-db-admin-page.component';
import {CaAdminGuard} from '../ca-core/guard/ca-admin-guard.service';
import {CaMySmartDbsPageComponent} from './ca-my-smart-dbs-page/ca-my-smart-dbs-page/ca-my-smart-dbs-page.component';

const routes: Route[] = [
  {path: '', component: CaMySmartDbsPageComponent},
  {path: ':smartDbId', component: CaSmartDbSearchPageComponent},
  {path: ':smartDbId/doc/:docId', component: CaSmartDbDocPageComponent},
  {path: ':smartDbId/admin', component: CaSmartDbAdminPageComponent, canActivate: [CaAdminGuard]}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaSmartDbRoutingModule {
}
