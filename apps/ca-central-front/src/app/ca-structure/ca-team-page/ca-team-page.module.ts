import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaTeamPageComponent} from './component/ca-team-page/ca-team-page.component';
import {CaTeamDetailComponent} from './component/ca-team-detail/ca-team-detail.component';
import {CaTeamUsersListComponent} from './component/ca-team-users-list/ca-team-users-list.component';
import {CaProjectCoreModule} from '../../ca-core/entity-module/ca-project-core/ca-project-core.module';
import {CaTeamProjectsListComponent} from './component/ca-team-projects-list/ca-team-projects-list.component';
import {CaGroupCoreModule} from '../../ca-core/entity-module/ca-group-core/ca-group-core.module';
import {RouterModule} from '@angular/router';

/**
 * Module for the page of group of type USERS
 */
@NgModule({
  declarations: [
    CaTeamPageComponent,
    CaTeamDetailComponent,
    CaTeamUsersListComponent,
    CaTeamProjectsListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
    CaProjectCoreModule,
    CaGroupCoreModule,
  ]
})
export class CaTeamPageModule { }
