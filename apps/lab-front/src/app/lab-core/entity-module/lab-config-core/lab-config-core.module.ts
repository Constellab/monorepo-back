import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../lab-core.module';
import {LabConfigureSpecsFormComponent} from './component/lab-configure-specs-form/lab-configure-specs-form.component';
import {
  LabConfigureSpecsFormDialogComponent
} from './component/lab-configure-specs-form-dialog/lab-configure-specs-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabTagDynamicFieldComponent} from './component/lab-tag-dynamic-field/lab-tag-dynamic-field.component';
import {
  LabCodeEditorDynamicFieldComponent
} from './component/lab-code-editor-dynamic-field/lab-code-editor-dynamic-field.component';


@NgModule({
  declarations: [
    LabConfigureSpecsFormComponent,
    LabConfigureSpecsFormDialogComponent,
    LabTagDynamicFieldComponent,
    LabCodeEditorDynamicFieldComponent,
  ],
  exports: [
    LabConfigureSpecsFormComponent,
    LabCodeEditorDynamicFieldComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    LabCoreModule,
  ],
})
export class LabConfigCoreModule {
}
