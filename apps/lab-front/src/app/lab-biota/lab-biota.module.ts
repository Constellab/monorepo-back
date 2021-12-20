import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {LabBiotaRoutingModule} from './lab-biota-routing.module';
import {LabBiotaDatabasesModule} from './module/lab-biota-databases/lab-biota-databases.module';
import {LabBiotaCoreModule} from './module/lab-biota-core/lab-biota-core.module';
import {LabBiotaDatabaseDetailModule} from './module/lab-biota-database-detail/lab-biota-database-detail.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    LabBiotaDatabasesModule,
    LabBiotaDatabaseDetailModule,
    LabBiotaCoreModule,

    LabBiotaRoutingModule
  ]
})
export class LabBiotaModule {
}
