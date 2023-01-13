import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSpacePageModule} from './ca-space-page/ca-space-page.module';
import {CaStructureRoutingModule} from './ca-structure-routing.module';
import {CaMyGroupsPageModule} from './ca-my-groups-page/ca-my-groups-page.module';
import {CaTeamPageModule} from './ca-team-page/ca-team-page.module';

/**
 * Module that group the space, group and user management
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    CaSpacePageModule,
    CaMyGroupsPageModule,
    CaTeamPageModule,

    CaStructureRoutingModule,
  ]
})
export class CaStructureModule {
}
