import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaCurrentSpacePageComponent
} from './ca-space-page/component/ca-current-space-page/ca-current-space-page.component';
import {CaMyTeamsPageComponent} from './ca-my-groups-page/component/ca-my-teams-page/ca-my-teams-page.component';
import {CaTeamPageComponent} from './ca-team-page/component/ca-team-page/ca-team-page.component';
import {
  CaJoinSpacePageComponent
} from './ca-join-space-page/ca-join-space-page/ca-join-space-page.component';

const routes: Route[] = [
  {path: 'current-space', component: CaCurrentSpacePageComponent},
  {path: 'team/:id', component: CaTeamPageComponent},
  {path: 'my-teams', component: CaMyTeamsPageComponent},
  {path: 'join-space/:code', component: CaJoinSpacePageComponent},
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

