import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaOrganizationPageModule} from './ca-organization-page/ca-organization-page.module';
import {CaStructureRoutingModule} from './ca-structure-routing.module';

/**
 * Module that group the organization, group and user management
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    CaOrganizationPageModule,

    CaStructureRoutingModule,
  ]
})
export class CaStructureModule {
}
