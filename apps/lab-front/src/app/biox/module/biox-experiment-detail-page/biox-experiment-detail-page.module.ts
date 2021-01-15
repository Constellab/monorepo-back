import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {BioxExperimentDetailPageComponent} from './component/biox-experiment-detail-page/biox-experiment-detail-page.component';
import {BioxExperimentCoreModule} from '../../../core/entity-module/biox-experiment-core/biox-experiment-core.module';


@NgModule({
  declarations: [
    BioxExperimentDetailPageComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
    BioxExperimentCoreModule,
  ]
})
export class BioxExperimentDetailPageModule {
}
