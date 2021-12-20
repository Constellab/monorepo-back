import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaSettingsPageComponent} from './component/ca-settings-page/ca-settings-page.component';

const routes: Route[] = [
  {
    path: '', component: CaSettingsPageComponent
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
export class CaSettingsRoutingModule {
}
