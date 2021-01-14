import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StatusChipComponent} from './status-chip/status-chip.component';
import {UpdateStatusFormDialogComponent} from './update-status-form-dialog/update-status-form-dialog.component';
import {StatusHistoryListDialogComponent} from './status-history-list-dialog/status-history-list-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CustomMaterialModule} from '../../custom-material/custom-material.module';
import {StatusHistoryCardComponent} from './status-history-card/status-history-card.component';
import {CustomLibraryModule} from '../../custom-library/custom-library.module';


/**
 * Module that contains the components to manage the status and StatusHistory
 */
@NgModule({
  declarations: [
    StatusChipComponent,
    UpdateStatusFormDialogComponent,
    StatusHistoryListDialogComponent,
    StatusHistoryCardComponent,
  ],
  exports: [
    StatusChipComponent,
    UpdateStatusFormDialogComponent,
    StatusHistoryListDialogComponent,
    StatusHistoryCardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CustomMaterialModule,
    CustomLibraryModule,
  ]
})
export class StatusModule {
}
