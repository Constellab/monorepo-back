import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaSmartDbPageComponent} from './component/ca-smart-db-page/ca-smart-db-page.component';

const routes: Route[] = [
  {
    path: '', component: CaSmartDbPageComponent,
  }
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
