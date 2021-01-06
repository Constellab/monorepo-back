import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectDetailPageComponent} from './component/project-detail-page/project-detail-page.component';
import {CoreModule} from '../../../core/core.module';
import {ProjectCoreModule} from '../../../core/entity-module/project-core/project-core.module';
import {ProjectDetailComponent} from './component/project-detail/project-detail.component';
import {RouterModule} from '@angular/router';
import {StudiesListComponent} from './component/studies-list/studies-list.component';
import {StudyCoreModule} from '../study-core/study-core.module';

/**
 * Module for the project detail page
 */
@NgModule({
  declarations: [
    ProjectDetailPageComponent,
    ProjectDetailComponent,
    StudiesListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    CoreModule,
    ProjectCoreModule,
    StudyCoreModule,
  ]
})
export class ProjectDetailPageModule {
}
