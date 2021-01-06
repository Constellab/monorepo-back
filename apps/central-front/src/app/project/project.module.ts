import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../core/core.module';
import {ProjectCoreModule} from '../core/entity-module/project-core/project-core.module';
import {MyProjectsPageComponent} from './component/my-projects-page/my-projects-page.component';
import {ProjectRoutingModule} from './project-routing.module';

/**
 * Modules for the 'My projects' page
 */
@NgModule({
  declarations: [
    MyProjectsPageComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
    ProjectCoreModule,

    ProjectRoutingModule,
  ]
})
export class ProjectModule {
}
