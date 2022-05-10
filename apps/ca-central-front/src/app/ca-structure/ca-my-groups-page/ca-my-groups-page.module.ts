import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaMyGroupsPageComponent} from './component/ca-my-groups-page/ca-my-groups-page.component';
import {CaGroupCoreModule} from '../../ca-core/entity-module/ca-group-core/ca-group-core.module';


@NgModule({
  declarations: [
    CaMyGroupsPageComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaGroupCoreModule,
  ]
})
export class CaMyGroupsPageModule {
}
