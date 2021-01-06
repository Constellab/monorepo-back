import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {MyLabsPageComponent} from './component/my-labs-page/my-labs-page.component';


const routes: Route[] = [
  {path: '', component: MyLabsPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class LabRoutingModule {
}
