import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaMainAppComponent} from './component/ca-main-app/ca-main-app.component';
import {CaMainRoutingModule} from './ca-main-routing.module';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaNotificationsModule} from '../ca-notifications/ca-notifications.module';
import {
  CaMyOrganizationsPortalComponent
} from './component/ca-my-organizations-portal/ca-my-organizations-portal.component';
import {CaOrganizationCoreModule} from '../ca-core/entity-module/ca-organization-core/ca-organization-core.module';

/**
 * Main modules tha manage the pages once the user is connected
 */
@NgModule({
  declarations: [
    CaMainAppComponent,
    CaMyOrganizationsPortalComponent
  ],
  imports: [
    CommonModule,

    CaCoreModule,
    CaOrganizationCoreModule,

    // routing
    CaMainRoutingModule,
    CaCoreModule,
    CaNotificationsModule
  ]
})
export class CaMainModule {
}
