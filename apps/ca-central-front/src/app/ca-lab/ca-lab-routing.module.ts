import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaMyLabsPageComponent} from './component/ca-my-labs-page/ca-my-labs-page.component';


const routes: Route[] = [
  {path: '', component: CaMyLabsPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaLabRoutingModule {
}
