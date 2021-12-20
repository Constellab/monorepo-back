import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../lab-core.module';
import {LabConfigureSpecsFormComponent} from './component/lab-configure-specs-form/lab-configure-specs-form.component';
import {
  LabConfigureSpecsFormDialogComponent
} from './component/lab-configure-specs-form-dialog/lab-configure-specs-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    LabConfigureSpecsFormComponent,
    LabConfigureSpecsFormDialogComponent,
  ],
  exports: [
    LabConfigureSpecsFormComponent,
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
