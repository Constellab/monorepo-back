import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaSmartDbSearchPageComponent
} from './ca-smart-db-search-page/component/ca-smart-db-search-page/ca-smart-db-search-page.component';
import {
  CaSmartDbDocPageComponent
} from './ca-smart-db-doc-page/component/ca-smart-db-doc-page/ca-smart-db-doc-page.component';

const routes: Route[] = [
  {path: '', component: CaSmartDbSearchPageComponent},
  {path: ':id', component: CaSmartDbDocPageComponent}
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
