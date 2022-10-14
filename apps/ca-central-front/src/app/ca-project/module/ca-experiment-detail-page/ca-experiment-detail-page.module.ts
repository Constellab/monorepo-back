import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CaExperimentDetailPageComponent
} from './component/ca-experiment-detail-page/ca-experiment-detail-page.component';
import {
  CaExperimentCardDetailComponent
} from './component/ca-experiment-card-detail/ca-experiment-card-detail.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaExperimentCoreModule} from '../ca-experiment-core/ca-experiment-core.module';
import {CaReportCoreModule} from '../ca-report-core/ca-report-core.module';
import {RouterModule} from '@angular/router';
import {CaLabCoreModule} from '../../../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaExperimentDetailPageRoutingModule} from './ca-experiment-detail-page-routing.module';
import {CaProjectObjectCoreModule} from '../ca-project-object-core/ca-project-object-core.module';


@NgModule({
  declarations: [
    CaExperimentDetailPageComponent,
    CaExperimentCardDetailComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaProjectObjectCoreModule,
    CaExperimentCoreModule,
    CaLabCoreModule,
    CaReportCoreModule,

    CaExperimentDetailPageRoutingModule,
  ]
})
export class CaExperimentDetailPageModule {
}
