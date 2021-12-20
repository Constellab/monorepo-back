import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  BiotaDatabaseDetailPageComponent
} from './component/biota-database-detail-page/biota-database-detail-page.component';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {LabBiotaCoreModule} from '../lab-biota-core/lab-biota-core.module';


@NgModule({
  declarations: [
    BiotaDatabaseDetailPageComponent,
  ],
  imports: [
    CommonModule,

    LabCoreModule,
    LabBiotaCoreModule,
  ]
})
export class LabBiotaDatabaseDetailModule {
}
