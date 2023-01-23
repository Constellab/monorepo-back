import {Route, RouterModule} from '@angular/router';
import { HaStoryListPageComponent } from './module/ha-story-list-page/ha-story-list-page.component';
import {HaStoryEditPageComponent} from './module/ha-story-edit-page/ha-story-edit-page.component';
import {HaStoryPageComponent} from './module/ha-story-page/ha-story-page.component';
import {NgModule} from '@angular/core';
import {HaStoryMyListComponent} from './module/ha-story-my-list/ha-story-my-list.component';

const routes: Route[] = [
  {
    path: '',
    component: HaStoryListPageComponent
  },
  {
    path: 'my-stories',
    component: HaStoryMyListComponent
  },
  {
    path: 'edit/:id',
    component: HaStoryEditPageComponent
  },
  {
    path: ':id',
    component: HaStoryPageComponent
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class HaStoryRoutingModule {
}
