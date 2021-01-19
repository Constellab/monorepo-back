import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CoreModule} from '../../core.module';
import { BioxProcessCardComponent } from './component/biox-process-card/biox-process-card.component';



@NgModule({
  declarations: [BioxProcessCardComponent],
  imports: [
    CommonModule,

    CoreModule,
  ],
  exports: [BioxProcessCardComponent]
})
export class BioxProcessCoreModule { }
