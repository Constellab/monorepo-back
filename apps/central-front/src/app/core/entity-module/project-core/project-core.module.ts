import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectCardComponent} from './component/project-card/project-card.component';
import {ProjectFormDialogComponent} from './component/project-form-dialog/project-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CoreModule} from '../../core.module';
import {ProjectInfoComponent} from './component/project-info/project-info.component';
import {ProjectsListComponent} from './component/projects-list/projects-list.component';
import {RouterModule} from '@angular/router';

/**
 * Importable module to get project components and pipe
 */
@NgModule({
  declarations: [
    // Component
    ProjectCardComponent,
    ProjectFormDialogComponent,
    ProjectsListComponent,
    ProjectInfoComponent,
  ],
  exports: [
    // Component
    ProjectCardComponent,
    ProjectFormDialogComponent,
    ProjectsListComponent,
    ProjectInfoComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,

    CoreModule
  ]
})
export class ProjectCoreModule {
}
