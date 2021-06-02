import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../core.module';
import {BioxConfigureSpecsFormComponent} from './component/biox-configure-specs-form/biox-configure-specs-form.component';
import {BioxConfigureSpecsFormDialogComponent} from './component/biox-configure-specs-form-dialog/biox-configure-specs-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    BioxConfigureSpecsFormComponent,
    BioxConfigureSpecsFormDialogComponent,
  ],
  exports: [
    BioxConfigureSpecsFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
  ],
})
export class BioxConfigCoreModule {
}
