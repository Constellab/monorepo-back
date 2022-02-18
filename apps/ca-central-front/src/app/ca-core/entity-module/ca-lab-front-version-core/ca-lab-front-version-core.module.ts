import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CaLabFrontVersionTableComponent
} from './component/ca-lab-front-version-table/ca-lab-front-version-table.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaCoreModule} from '../../ca-core.module';
import {
  CaLabFrontVersionFormDialogComponent
} from './component/ca-lab-front-version-form-dialog/ca-lab-front-version-form-dialog.component';
import {CaBrickCoreModule} from '../ca-brick-core/ca-brick-core.module';


@NgModule({
  declarations: [
    CaLabFrontVersionTableComponent,
    CaLabFrontVersionFormDialogComponent,
  ],
  exports: [
    CaLabFrontVersionTableComponent,
    CaLabFrontVersionFormDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaBrickCoreModule,
  ]
})
export class CaLabFrontVersionCoreModule {
}
