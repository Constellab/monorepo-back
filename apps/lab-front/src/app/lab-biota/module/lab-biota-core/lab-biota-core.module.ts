import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabBiotaDatabaseSelectOptionsComponent
} from './lab-biota-database-select-options/lab-biota-database-select-options.component';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {
  LabBiotaDatabaseSearchFormComponent
} from './lab-biota-database-search-form/lab-biota-database-search-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabBiotaDatabaseTableComponent} from './lab-biota-database-table/lab-biota-database-table.component';


@NgModule({
  declarations: [
    LabBiotaDatabaseSelectOptionsComponent,
    LabBiotaDatabaseSearchFormComponent,
    LabBiotaDatabaseTableComponent,
  ],
  exports: [
    LabBiotaDatabaseSelectOptionsComponent,
    LabBiotaDatabaseSearchFormComponent,
    LabBiotaDatabaseTableComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    LabCoreModule,
  ]
})
export class LabBiotaCoreModule {
}
