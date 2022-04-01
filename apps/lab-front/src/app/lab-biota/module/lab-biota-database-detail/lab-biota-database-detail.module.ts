import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabBiotaDatabaseDetailPageComponent
} from './component/lab-biota-database-detail-page/lab-biota-database-detail-page.component';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {LabBiotaCoreModule} from '../lab-biota-core/lab-biota-core.module';


@NgModule({
  declarations: [
    LabBiotaDatabaseDetailPageComponent,
  ],
  imports: [
    CommonModule,

    LabCoreModule,
    LabBiotaCoreModule,
  ]
})
export class LabBiotaDatabaseDetailModule {
}
