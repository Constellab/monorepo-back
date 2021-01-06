import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {SettingsPageComponent} from './component/settings-page/settings-page.component';

const routes: Route[] = [
  {
    path: '', component: SettingsPageComponent
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
export class SettingsRoutingModule {
}
