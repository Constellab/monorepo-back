import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BiotaDatabaseSelectOptionsComponent} from './biota-database-select-options/biota-database-select-options.component';
import {CoreModule} from '../../../core/core.module';
import {BiotaDatabaseSearchFormComponent} from './biota-database-search-form/biota-database-search-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BiotaDatabaseTableComponent} from './biota-database-table/biota-database-table.component';


@NgModule({
  declarations: [
    BiotaDatabaseSelectOptionsComponent,
    BiotaDatabaseSearchFormComponent,
    BiotaDatabaseTableComponent,
  ],
  exports: [
    BiotaDatabaseSelectOptionsComponent,
    BiotaDatabaseSearchFormComponent,
    BiotaDatabaseTableComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
  ]
})
export class BiotaCoreModule {
}
