import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BiotaDatabaseDetailPageComponent} from './component/biota-database-detail-page/biota-database-detail-page.component';
import {BiotaDatabaseTableComponent} from './component/biota-database-table/biota-database-table.component';
import {CoreModule} from '../../../core/core.module';


@NgModule({
  declarations: [
    BiotaDatabaseDetailPageComponent,
    BiotaDatabaseTableComponent],
  imports: [
    CommonModule,

    CoreModule,
  ]
})
export class BiotaDatabaseDetailModule {
}
