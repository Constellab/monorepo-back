import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabUserSelectOptionsComponent} from './component/lab-user-select-options/lab-user-select-options.component';
import {LabCoreModule} from '../../lab-core.module';


@NgModule({
  declarations: [
    LabUserSelectOptionsComponent
  ],
  exports: [
    LabUserSelectOptionsComponent
  ],
  imports: [
    CommonModule,

    LabCoreModule
  ],
})
export class LabUserCoreModule { }
