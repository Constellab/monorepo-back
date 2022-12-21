import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {LabCoreModule} from '../../lab-core.module';
import {
  LabShareLinkFormDialogComponent
} from './component/lab-share-link-form-dialog/lab-share-link-form-dialog.component';
import {LabShareLinkTableComponent} from './component/lab-share-link-table/lab-share-link-table.component';
import {
  LabShareLinkActionsMenuComponent
} from './component/lab-share-link-actions-menu/lab-share-link-actions-menu.component';
import {LabSharedEntityOriginComponent} from './component/lab-shared-entity-origin/lab-shared-entity-origin.component';
import {
  LabSharedEntityOriginDialogComponent
} from './component/lab-shared-entity-origin-dialog/lab-shared-entity-origin-dialog.component';
import {LabSharedEntityTableComponent} from './component/lab-shared-entity-table/lab-shared-entity-table.component';
import {LabSharedEntityInfoComponent} from './component/lab-shared-entity-info/lab-shared-entity-info.component';

/**
 * Module for the share link and shared entity
 */
@NgModule({
  declarations: [
    LabShareLinkFormDialogComponent,
    LabShareLinkTableComponent,
    LabShareLinkActionsMenuComponent,
    LabSharedEntityOriginComponent,
    LabSharedEntityOriginDialogComponent,
    LabSharedEntityTableComponent,
    LabSharedEntityInfoComponent
  ],
  exports: [
    LabShareLinkFormDialogComponent,
    LabShareLinkTableComponent,
    LabShareLinkActionsMenuComponent,
    LabSharedEntityOriginComponent,
    LabSharedEntityOriginDialogComponent,
    LabSharedEntityTableComponent,
    LabSharedEntityInfoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    LabCoreModule
  ],
})
export class LabShareCoreModule {
}
