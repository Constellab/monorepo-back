import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaMyTeamsPageComponent} from './component/ca-my-teams-page/ca-my-teams-page.component';
import {CaGroupCoreModule} from '../../ca-core/entity-module/ca-group-core/ca-group-core.module';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    CaMyTeamsPageComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CaCoreModule,
    CaGroupCoreModule,
  ]
})
export class CaMyGroupsPageModule {
}
