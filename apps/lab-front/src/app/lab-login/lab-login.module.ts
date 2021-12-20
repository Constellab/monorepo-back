import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabLoginPageComponent} from './component/lab-login-page/lab-login-page.component';
import {LabLoginRoutingModule} from './lab-login-routing.module';
import {LabCoreModule} from '../lab-core/lab-core.module';

/**
 * Module containing page when the user in not logged
 */
@NgModule({
  declarations: [
    LabLoginPageComponent,

  ],
  imports: [
    CommonModule,

    LabCoreModule,

    // routing
    LabLoginRoutingModule,
  ]
})
export class LabLoginModule {
}
