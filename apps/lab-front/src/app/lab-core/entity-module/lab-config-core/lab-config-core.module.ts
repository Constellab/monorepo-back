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
  LabPythonCodeDynamicFieldComponent
} from './component/lab-python-code-dynamic-field/lab-python-code-dynamic-field.component';
import {LabPythonEditorComponent} from '../../standalone-component/lab-python-editor/lab-python-editor.component';


@NgModule({
  declarations: [
    LabConfigureSpecsFormComponent,
    LabConfigureSpecsFormDialogComponent,
    LabTagDynamicFieldComponent,
    LabPythonCodeDynamicFieldComponent,
  ],
  exports: [
    LabConfigureSpecsFormComponent,
    LabPythonCodeDynamicFieldComponent,
  ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        LabCoreModule,
        LabPythonEditorComponent,
    ],
})
export class LabConfigCoreModule {
}
