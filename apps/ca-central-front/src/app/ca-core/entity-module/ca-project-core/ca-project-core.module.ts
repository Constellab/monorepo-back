import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaProjectCardComponent} from './component/ca-project-card/ca-project-card.component';
import {CaProjectFormDialogComponent} from './component/ca-project-form-dialog/ca-project-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaCoreModule} from '../../ca-core.module';
import {CaProjectInfoComponent} from './component/ca-project-info/ca-project-info.component';
import {CaProjectsListComponent} from './component/ca-projects-list/ca-projects-list.component';
import {RouterModule} from '@angular/router';
import {CaProjectTableComponent} from './component/ca-project-table/ca-project-table.component';

/**
 * Importable module to get project components and pipe
 */
@NgModule({
  declarations: [
    // Component
    CaProjectCardComponent,
    CaProjectFormDialogComponent,
    CaProjectsListComponent,
    CaProjectInfoComponent,
    CaProjectTableComponent,
  ],
  exports: [
    // Component
    CaProjectCardComponent,
    CaProjectFormDialogComponent,
    CaProjectsListComponent,
    CaProjectInfoComponent,
    CaProjectTableComponent,
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
