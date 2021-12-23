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


@NgModule({
  declarations: [
    LabProjectSelectOptionsComponent,
    LabValidateObjectDialogComponent,
  ],
  exports: [
    LabProjectSelectOptionsComponent,
    LabValidateObjectDialogComponent,
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
