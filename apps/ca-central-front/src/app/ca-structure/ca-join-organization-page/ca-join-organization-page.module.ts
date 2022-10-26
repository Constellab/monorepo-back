import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaJoinOrganizationPageComponent} from './ca-join-organization-page/ca-join-organization-page.component';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaOrganizationCoreModule} from '../../ca-core/entity-module/ca-organization-core/ca-organization-core.module';


@NgModule({
  declarations: [
    CaJoinOrganizationPageComponent
  ],
  imports: [
    CommonModule,

    CaCoreModule,
    CaOrganizationCoreModule,
  ]
})
export class CaJoinOrganizationPageModule { }
