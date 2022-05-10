import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaOrganizationPageComponent
} from './ca-organization-page/component/ca-organization-page/ca-organization-page.component';
import {CaMyGroupsPageComponent} from './ca-my-groups-page/component/ca-my-groups-page/ca-my-groups-page.component';
import {CaTeamPageComponent} from './ca-team-page/component/ca-team-page/ca-team-page.component';

const routes: Route[] = [
  {path: 'organization/:id', component: CaOrganizationPageComponent},
  {path: 'team/:id', component: CaTeamPageComponent},
  {path: 'my-teams', component: CaMyGroupsPageComponent}
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

