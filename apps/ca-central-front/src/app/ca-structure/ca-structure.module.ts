import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaOrganizationPageModule} from './ca-organization-page/ca-organization-page.module';
import {CaStructureRoutingModule} from './ca-structure-routing.module';
import {CaMyGroupsPageModule} from './ca-my-groups-page/ca-my-groups-page.module';
import {CaTeamPageModule} from './ca-team-page/ca-team-page.module';
import {CaJoinOrganizationPageModule} from './ca-join-organization-page/ca-join-organization-page.module';

/**
 * Module that group the organization, group and user management
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    CaOrganizationPageModule,
    CaMyGroupsPageModule,
    CaTeamPageModule,
    CaJoinOrganizationPageModule,

    CaStructureRoutingModule,
  ]
})
export class CaStructureModule {
}
