import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BiotaDatabasesComponent} from './component/biota-databases/biota-databases.component';
import {BiotaDatabaseCardComponent} from './component/biota-database-card/biota-database-card.component';
import {CoreModule} from '../../../core/core.module';
import {RouterModule} from '@angular/router';
import {BiotaCoreModule} from '../biota-core/biota-core.module';

/**
 * Module for the main biota page to list the databases
 */
@NgModule({
  declarations: [
    BiotaDatabasesComponent,
    BiotaDatabaseCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    CoreModule,
    BiotaCoreModule,
  ]
})
export class BiotaDatabasesModule {
}
