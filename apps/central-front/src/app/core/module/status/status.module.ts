import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StatusChipComponent} from './status-chip/status-chip.component';
import {UpdateStatusFormDialogComponent} from './update-status-form-dialog/update-status-form-dialog.component';
import {StatusHistoryListDialogComponent} from './status-history-list-dialog/status-history-list-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CustomMaterialModule} from '../../custom-material/custom-material.module';
import {CoreTranslateModule} from '../translate/core-translate.module';
import {CorePipeModule} from '../core-pipe/core-pipe.module';
import {LoaderModule} from '../loader/loader.module';
import {StatusHistoryCardComponent} from './status-history-card/status-history-card.component';
import {SectionModule} from '../section/section.module';
import {CoreComponentModule} from '../core-component/core-component.module';
import {CoreDirectiveModule} from '../core-directive/core-directive.module';
import {TextIconModule} from '../text-icon/text-icon.module';


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

    CoreTranslateModule,
    CorePipeModule,
    LoaderModule,
    SectionModule,
    CoreComponentModule,
    CoreDirectiveModule,
    TextIconModule,

    CustomMaterialModule,
  ]
})
export class StatusModule {
}
