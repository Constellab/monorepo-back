import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabBiotaDatabasesComponent} from './component/lab-biota-databases/lab-biota-databases.component';
import {LabBiotaDatabaseCardComponent} from './component/lab-biota-database-card/lab-biota-database-card.component';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {RouterModule} from '@angular/router';
import {LabBiotaCoreModule} from '../lab-biota-core/lab-biota-core.module';
import {LabBiotaDataCardComponent} from './component/lab-biota-data-card/lab-biota-data-card.component';
import {
  LabBiotaDataCardDialogComponent
} from './component/lab-biota-data-card-dialog/lab-biota-data-card-dialog.component';

/**
 * Module for the main biota page to list the databases
 */
@NgModule({
  declarations: [
    LabBiotaDatabasesComponent,
    LabBiotaDatabaseCardComponent,
    LabBiotaDataCardComponent,
    LabBiotaDataCardDialogComponent
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
