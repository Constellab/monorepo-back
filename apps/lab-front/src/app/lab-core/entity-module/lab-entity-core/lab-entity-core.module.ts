import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../lab-core.module';
import {
  LabValidateObjectDialogComponent
} from './component/lab-validate-object-dialog/lab-validate-object-dialog.component';
import {LabSyncObjectButtonComponent} from './component/lab-sync-object-button/lab-sync-object-button.component';
import {LabObjectSyncInfoComponent} from './component/lab-object-sync-info/lab-object-sync-info.component';
import {
  LabObjectValidationInfoComponent
} from './component/lab-object-validation-info/lab-object-validation-info.component';
import {LabProjectCoreModule} from '../lab-project-core/lab-project-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabHighlightButtonComponent} from './component/lab-highlight-button/lab-highlight-button.component';

/**
 * Module for generic components of entities
 */
@NgModule({
  declarations: [
    LabValidateObjectDialogComponent,
    LabSyncObjectButtonComponent,
    LabObjectSyncInfoComponent,
    LabObjectValidationInfoComponent,
    LabHighlightButtonComponent,
  ],
  exports: [
    LabValidateObjectDialogComponent,
    LabSyncObjectButtonComponent,
    LabObjectSyncInfoComponent,
    LabObjectValidationInfoComponent,
    LabHighlightButtonComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    LabCoreModule,
    LabProjectCoreModule,
  ]
})
export class LabEntityCoreModule {
}
