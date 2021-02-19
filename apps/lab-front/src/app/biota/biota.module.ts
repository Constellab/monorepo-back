import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {BiotaRoutingModule} from './biota-routing.module';
import {BiotaDatabasesModule} from './module/biota-databases/biota-databases.module';
import {BiotaCoreModule} from './module/biota-core/biota-core.module';
import {BiotaDatabaseDetailModule} from './module/biota-database-detail/biota-database-detail.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    BiotaDatabasesModule,
    BiotaDatabaseDetailModule,
    BiotaCoreModule,

    BiotaRoutingModule
  ]
})
export class BiotaModule {
}
