import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../lab-core.module';
import {LabProgressBarInfoComponent} from './component/lab-progress-bar-info/lab-progress-bar-info.component';
import {
  LabProgressBarInfoDialogComponent
} from './component/lab-progress-bar-info-dialog/lab-progress-bar-info-dialog.component';
import {LabProgressMessageComponent} from './component/lab-progress-message/lab-progress-message.component';


@NgModule({
  declarations: [
    LabProgressBarInfoComponent,
    LabProgressBarInfoDialogComponent,
    LabProgressMessageComponent,
  ],
  exports: [
    LabProgressBarInfoComponent,
    LabProgressBarInfoDialogComponent,
    LabProgressMessageComponent,
  ],
  imports: [
    CommonModule,

    LabCoreModule,
  ]
})
export class LabProgressBarCoreModule {
}
