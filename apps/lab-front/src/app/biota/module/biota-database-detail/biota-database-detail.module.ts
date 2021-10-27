import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BiotaDatabaseDetailPageComponent} from './component/biota-database-detail-page/biota-database-detail-page.component';
import {CoreModule} from '../../../core/core.module';
import {BiotaCoreModule} from '../biota-core/biota-core.module';


@NgModule({
  declarations: [
    BiotaDatabaseDetailPageComponent,
  ],
  imports: [
    CommonModule,

    CoreModule,
    BiotaCoreModule,
  ]
})
export class BiotaDatabaseDetailModule {
}
