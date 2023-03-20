import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabProjectSelectOptionsComponent
} from './component/lab-project-select-options/lab-project-select-options.component';
import {LabCoreModule} from '../../lab-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  LabProjectSelectButtonComponent
} from './component/lab-project-select-button/lab-project-select-button.component';
import {LabProjectSelectComponent} from './component/lab-project-select/lab-project-select.component';
import { LabProjectInlineComponent } from './component/lab-project-inline/lab-project-inline.component';


@NgModule({
  declarations: [
    LabProjectSelectOptionsComponent,
    LabProjectSelectButtonComponent,
    LabProjectSelectComponent,
    LabProjectInlineComponent,

  ],
  exports: [
    LabProjectSelectOptionsComponent,
    LabProjectSelectButtonComponent,
    LabProjectSelectComponent,
    LabProjectInlineComponent,

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
