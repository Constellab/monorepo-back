import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaProjectCardComponent} from './component/ca-project-card/ca-project-card.component';
import {DaProjectFormDialogComponent} from './component/ca-project-form-dialog/da-project-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaCoreModule} from '../../ca-core.module';
import {DaProjectInfoComponent} from './component/ca-project-info/da-project-info.component';
import {CaProjectsListComponent} from './component/ca-projects-list/ca-projects-list.component';
import {RouterModule} from '@angular/router';

/**
 * Importable module to get project components and pipe
 */
@NgModule({
  declarations: [
    // Component
    CaProjectCardComponent,
    DaProjectFormDialogComponent,
    CaProjectsListComponent,
    DaProjectInfoComponent,
  ],
  exports: [
    // Component
    CaProjectCardComponent,
    DaProjectFormDialogComponent,
    CaProjectsListComponent,
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
