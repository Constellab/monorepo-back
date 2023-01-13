import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaCurrentSpacePageComponent
} from './ca-space-page/component/ca-current-space-page/ca-current-space-page.component';
import {CaMyTeamsPageComponent} from './ca-my-groups-page/component/ca-my-teams-page/ca-my-teams-page.component';
import {CaTeamPageComponent} from './ca-team-page/component/ca-team-page/ca-team-page.component';
import {
  CaCurrentSpaceDashboardPageComponent
} from './ca-space-page/component/ca-current-space-dashboard-page/ca-current-space-dashboard-page.component';
import {
  CaCurrentSpaceUsersPageComponent
} from './ca-space-page/component/ca-current-space-users-page/ca-current-space-users-page.component';
import {
  CaCurrentSpaceLabInstancesPageComponent
} from './ca-space-page/component/ca-current-space-lab-instances-page/ca-current-space-lab-instances-page.component';
import {
  CaCurrentSpaceProjectsPageComponent
} from './ca-space-page/component/ca-current-space-projects-page/ca-current-space-projects-page.component';

const routes: Route[] = [
  {
    path: 'current-space', component: CaCurrentSpacePageComponent, children: [
      {path: '', component: CaCurrentSpaceDashboardPageComponent},
      {path: 'users', component: CaCurrentSpaceUsersPageComponent},
      {path: 'labs', component: CaCurrentSpaceLabInstancesPageComponent},
      {path: 'projects', component: CaCurrentSpaceProjectsPageComponent},
    ]
  },
  {path: 'team/:id', component: CaTeamPageComponent},
  {path: 'my-teams', component: CaMyTeamsPageComponent},
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

