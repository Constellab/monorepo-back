import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {BioxExperimentDetailPageComponent} from './component/biox-experiment-detail-page/biox-experiment-detail-page.component';
import {LabExperimentCoreModule} from '../../../core/entity-module/lab-experiment-core/lab-experiment-core.module';


@NgModule({
  declarations: [
    BioxExperimentDetailPageComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
    LabExperimentCoreModule,
  ]
})
export class BioxExperimentDetailPageModule {
}
