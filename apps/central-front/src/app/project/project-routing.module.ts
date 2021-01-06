import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {MyProjectsPageComponent} from './component/my-projects-page/my-projects-page.component';

const routes: Route[] = [
  {path: '', component: MyProjectsPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ProjectRoutingModule {
}

