import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MainRoutingModule} from './main-routing.module';
import {MainAppComponent} from './component/main-app/main-app.component';
import {CoreModule} from '../core/core.module';
import {RouterModule} from '@angular/router';
import {LabEnvironmentToggleComponent} from './component/lab-environment-toggle/lab-environment-toggle.component';
import {ErrorDetailComponent} from './component/error-detail/error-detail.component';
import {MainMenuSettingsComponent} from './component/main-menu-settings/main-menu-settings.component';


@NgModule({
  declarations: [
    MainAppComponent,
    LabEnvironmentToggleComponent,
    ErrorDetailComponent,
    MainMenuSettingsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    CoreModule,

    // Routing
    MainRoutingModule
  ]
})
export class MainModule { }
