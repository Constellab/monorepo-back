import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabRunningProcessComponent } from './component/lab-running-process/lab-running-process.component';
import {LabProgressBarCoreModule} from '../lab-progress-bar-core/lab-progress-bar-core.module';



@NgModule({
  declarations: [
    LabRunningProcessComponent
  ],
  exports: [
    LabRunningProcessComponent
  ],
  imports: [
    CommonModule,
    LabProgressBarCoreModule
  ],
})
export class LabProcessCoreModule { }
