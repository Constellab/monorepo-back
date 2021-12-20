import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  BioxProjectSelectOptionsComponent
} from './component/biox-project-select-options/biox-project-select-options.component';
import {CoreModule} from '../../core.module';


@NgModule({
  declarations: [
    BioxProjectSelectOptionsComponent,
  ],
  exports: [
    BioxProjectSelectOptionsComponent,
  ],
  imports: [
    CommonModule,
    CoreModule
  ]
})
export class BioxProjectCoreModule {
}
