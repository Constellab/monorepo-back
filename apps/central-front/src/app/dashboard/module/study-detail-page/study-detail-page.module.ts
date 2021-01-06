import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudyDetailPageComponent} from './component/study-detail-page/study-detail-page.component';
import {CoreModule} from '../../../core/core.module';
import {StudyCoreModule} from '../study-core/study-core.module';
import {ExperimentsListComponent} from './component/experiments-list/experiments-list.component';
import {ExperimentCoreModule} from '../experiment-core/experiment-core.module';
import {RouterModule} from '@angular/router';
import {StudyDetailComponent} from './component/study-detail/study-detail.component';


@NgModule({
  declarations: [
    StudyDetailPageComponent,
    ExperimentsListComponent,
    StudyDetailComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CoreModule,
    StudyCoreModule,
    ExperimentCoreModule,
  ]
})
export class StudyDetailPageModule {
}
