import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSmartDbCardComponent} from './component/ca-smart-db-card/ca-smart-db-card.component';
import {CaCoreModule} from '../../ca-core.module';
import {CaSmartDbListComponent} from './component/ca-smart-db-list/ca-smart-db-list.component';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaSmartDbFormDialogComponent} from './component/ca-smart-db-form-dialog/ca-smart-db-form-dialog.component';
import {CaGroupCoreModule} from '../ca-group-core/ca-group-core.module';


@NgModule({
  declarations: [
    CaSmartDbCardComponent,
    CaSmartDbListComponent,
    CaSmartDbFormDialogComponent,
  ],
  exports: [
    CaSmartDbCardComponent,
    CaSmartDbListComponent,
    CaSmartDbFormDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaGroupCoreModule,
  ]
})
export class CaSmartDbCoreModule {
}
