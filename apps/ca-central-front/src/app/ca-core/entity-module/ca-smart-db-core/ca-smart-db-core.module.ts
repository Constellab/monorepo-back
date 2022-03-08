import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSmartDbCardComponent} from './component/ca-smart-db-card/ca-smart-db-card.component';
import {CaCoreModule} from '../../ca-core.module';
import {CaSmartDbListComponent} from './component/ca-smart-db-list/ca-smart-db-list.component';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    CaSmartDbCardComponent,
    CaSmartDbListComponent
  ],
  exports: [
    CaSmartDbCardComponent,
    CaSmartDbListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
  ]
})
export class CaSmartDbCoreModule {
}
