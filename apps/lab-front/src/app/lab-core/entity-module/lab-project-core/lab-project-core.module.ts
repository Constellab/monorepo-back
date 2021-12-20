import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabProjectSelectOptionsComponent
} from './component/lab-project-select-options/lab-project-select-options.component';
import {LabCoreModule} from '../../lab-core.module';


@NgModule({
  declarations: [
    LabProjectSelectOptionsComponent,
  ],
  exports: [
    LabProjectSelectOptionsComponent,
  ],
  imports: [
    CommonModule,
    LabCoreModule
  ]
})
export class LabProjectCoreModule {
}
