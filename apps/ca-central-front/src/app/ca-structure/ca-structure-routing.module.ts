import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaCurrentOrganizationPageComponent
} from './ca-organization-page/component/ca-current-organization-page/ca-current-organization-page.component';
import {CaMyTeamsPageComponent} from './ca-my-groups-page/component/ca-my-teams-page/ca-my-teams-page.component';
import {CaTeamPageComponent} from './ca-team-page/component/ca-team-page/ca-team-page.component';
import {
  CaJoinOrganizationPageComponent
} from './ca-join-organization-page/ca-join-organization-page/ca-join-organization-page.component';

const routes: Route[] = [
  {path: 'current-organization', component: CaCurrentOrganizationPageComponent},
  {path: 'team/:id', component: CaTeamPageComponent},
  {path: 'my-teams', component: CaMyTeamsPageComponent},
  {path: 'join-organization/:code', component: CaJoinOrganizationPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaStructureRoutingModule {
}

