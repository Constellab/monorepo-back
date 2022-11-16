import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaUserSettingsDialogComponent} from './component/ca-user-settings-dialog/ca-user-settings-dialog.component';

const routes: Route[] = [
  {
    path: '', component: CaUserSettingsDialogComponent
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
