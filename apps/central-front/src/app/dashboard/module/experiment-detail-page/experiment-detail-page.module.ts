import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentDetailPageComponent} from './component/experiment-detail-page/experiment-detail-page.component';
import {ExperimentCardDetailComponent} from './component/experiment-card-detail/experiment-card-detail.component';
import {CoreModule} from '../../../core/core.module';
import {ExperimentCoreModule} from '../experiment-core/experiment-core.module';
import {ReportsListComponent} from './component/reports-list/reports-list.component';
import {ReportCoreModule} from '../report-core/report-core.module';
import {ProtocolCoreModule} from '../../../core/entity-module/protocol-core/protocol-core.module';
import {RouterModule} from '@angular/router';
import {LabCoreModule} from '../../../core/entity-module/lab-core/lab-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ExperimentProtocolEditComponent} from './component/experiment-protocol-edit/experiment-protocol-edit.component';


@NgModule({
  declarations: [
    ExperimentDetailPageComponent,
    ExperimentCardDetailComponent,
    ReportsListComponent,
    ExperimentProtocolEditComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
    ExperimentCoreModule,
    LabCoreModule,
    ReportCoreModule,
    ProtocolCoreModule,
  ]
})
export class ExperimentDetailPageModule {
}
