import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {LabMainRoutingModule} from './lab-main-routing.module';
import {LabMainAppComponent} from './component/lab-main-app/lab-main-app.component';
import {LabCoreModule} from '../lab-core/lab-core.module';
import {RouterModule} from '@angular/router';
import {LabEnvironmentToggleComponent} from './component/lab-environment-toggle/lab-environment-toggle.component';
import {LabErrorDetailComponent} from './component/lab-error-detail/lab-error-detail.component';
import {LabMainMenuSettingsComponent} from './component/lab-main-menu-settings/lab-main-menu-settings.component';


@NgModule({
  declarations: [
    LabMainAppComponent,
    LabEnvironmentToggleComponent,
    LabErrorDetailComponent,
    LabMainMenuSettingsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    LabCoreModule,

    // Routing
    LabMainRoutingModule
  ]
})
export class LabMainModule { }
