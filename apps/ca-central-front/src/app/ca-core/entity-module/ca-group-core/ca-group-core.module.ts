import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaGroupSelectOptionsComponent} from './component/ca-group-select-options/ca-group-select-options.component';
import {CaCoreModule} from '../../ca-core.module';
import {CaGroupInlineComponent} from './component/ca-group-inline/ca-group-inline.component';
import {CaGroupTypeIconPipe} from './pipe/ca-group-type-icon.pipe';
import {CaGroupShareDialogComponent} from './component/ca-group-share-dialog/ca-group-share-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaTeamCardComponent} from './component/ca-team-card/ca-team-card.component';
import {RouterModule} from '@angular/router';
import {CaGroupAddUserDialogComponent} from './component/ca-group-add-user-dialog/ca-group-add-user-dialog.component';
import {CaTeamFormDialogComponent} from './component/ca-team-form-dialog/ca-team-form-dialog.component';
import {CaTeamTableComponent} from './component/ca-team-table/ca-team-table.component';
import {CaTeamActionMenuComponent} from './component/ca-team-action-menu/ca-team-action-menu.component';


@NgModule({
  declarations: [
    CaGroupSelectOptionsComponent,
    CaGroupInlineComponent,
    CaGroupTypeIconPipe,
    CaGroupShareDialogComponent,
    CaTeamCardComponent,
    CaGroupAddUserDialogComponent,
    CaTeamFormDialogComponent,
    CaTeamTableComponent,
    CaTeamActionMenuComponent
  ],
  exports: [
    CaGroupSelectOptionsComponent,
    CaGroupInlineComponent,
    CaGroupTypeIconPipe,
    CaGroupShareDialogComponent,
    CaTeamCardComponent,
    CaGroupAddUserDialogComponent,
    CaTeamFormDialogComponent,
    CaTeamTableComponent,
    CaTeamActionMenuComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CaCoreModule,
  ],
})
export class CaGroupCoreModule {
}
