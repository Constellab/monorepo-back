import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  CaUserCompleteInfoPageComponent
} from './component/ca-user-complete-info-page/ca-user-complete-info-page.component';

const loginRoutes: Routes = [
  {path: ':id', component: CaUserCompleteInfoPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(loginRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaUserCompleteInfoPageRoutingModule {
}
