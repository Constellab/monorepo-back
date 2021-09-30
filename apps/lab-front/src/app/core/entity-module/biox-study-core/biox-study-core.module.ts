import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxStudySelectOptionsComponent} from './component/biox-study-select-options/biox-study-select-options.component';
import {CoreModule} from '../../core.module';


@NgModule({
  declarations: [
    BioxStudySelectOptionsComponent,
  ],
  exports: [
    BioxStudySelectOptionsComponent,
  ],
  imports: [
    CommonModule,
    CoreModule
  ]
})
export class BioxStudyCoreModule {
}
