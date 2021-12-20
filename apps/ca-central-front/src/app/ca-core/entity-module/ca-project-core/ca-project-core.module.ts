import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DaProjectCardComponent} from './component/ca-project-card/da-project-card.component';
import {DaProjectFormDialogComponent} from './component/ca-project-form-dialog/da-project-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaCoreModule} from '../../ca-core.module';
import {DaProjectInfoComponent} from './component/ca-project-info/da-project-info.component';
import {DaProjectsListComponent} from './component/ca-projects-list/da-projects-list.component';
import {RouterModule} from '@angular/router';

/**
 * Importable module to get project components and pipe
 */
@NgModule({
  declarations: [
    // Component
    DaProjectCardComponent,
    DaProjectFormDialogComponent,
    DaProjectsListComponent,
    DaProjectInfoComponent,
  ],
  exports: [
    // Component
    DaProjectCardComponent,
    DaProjectFormDialogComponent,
    DaProjectsListComponent,
    DaProjectInfoComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,

    CaCoreModule
  ]
})
export class CaProjectCoreModule {
}
