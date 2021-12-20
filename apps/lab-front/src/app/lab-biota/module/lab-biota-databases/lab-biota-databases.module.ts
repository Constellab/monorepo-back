import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BiotaDatabasesComponent} from './component/biota-databases/biota-databases.component';
import {BiotaDatabaseCardComponent} from './component/biota-database-card/biota-database-card.component';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {RouterModule} from '@angular/router';
import {LabBiotaCoreModule} from '../lab-biota-core/lab-biota-core.module';
import {BiotaDataCardComponent} from './component/biota-data-card/biota-data-card.component';
import {BiotaDataCardDialogComponent} from './component/biota-data-card-dialog/biota-data-card-dialog.component';

/**
 * Module for the main biota page to list the databases
 */
@NgModule({
  declarations: [
    BiotaDatabasesComponent,
    BiotaDatabaseCardComponent,
    BiotaDataCardComponent,
    BiotaDataCardDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    LabCoreModule,
    LabBiotaCoreModule,
  ]
})
export class LabBiotaDatabasesModule {
}
