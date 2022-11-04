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
import {
  CaUpdateProjectLeaderDialogComponent
} from './component/ca-update-project-leader-dialog/ca-update-project-leader-dialog.component';
import {CaProjectInlineComponent} from './component/ca-project-inline/ca-project-inline.component';
import {CaSelectProjectComponent} from './component/ca-select-project/ca-select-project.component';

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
    CaUpdateProjectLeaderDialogComponent,
    CaProjectInlineComponent,
    CaSelectProjectComponent,
  ],
  exports: [
    // Component
    CaProjectCardComponent,
    CaProjectFormDialogComponent,
    CaProjectsListComponent,
    CaProjectInfoComponent,
    CaProjectTableComponent,
    CaUpdateProjectLeaderDialogComponent,
    CaProjectInlineComponent,
    CaSelectProjectComponent,
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
