import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabProjectSelectOptionsComponent
} from './component/lab-project-select-options/lab-project-select-options.component';
import {LabCoreModule} from '../../lab-core.module';
import {
  LabValidateObjectDialogComponent
} from './component/lab-validate-object-dialog/lab-validate-object-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabSyncObjectButtonComponent} from './component/lab-sync-object-button/lab-sync-object-button.component';
import {LabObjectSyncInfoComponent} from './component/lab-object-sync-info/lab-object-sync-info.component';
import {
  LabObjectValidationInfoComponent
} from './component/lab-object-validation-info/lab-object-validation-info.component';


@NgModule({
  declarations: [
    LabProjectSelectOptionsComponent,
    LabValidateObjectDialogComponent,
    LabSyncObjectButtonComponent,
    LabObjectSyncInfoComponent,
    LabObjectValidationInfoComponent,
  ],
  exports: [
    LabProjectSelectOptionsComponent,
    LabValidateObjectDialogComponent,
    LabSyncObjectButtonComponent,
    LabObjectSyncInfoComponent,
    LabObjectValidationInfoComponent,
  ],
  imports: [
    CommonModule,
    LabCoreModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class LabProjectCoreModule {
}
