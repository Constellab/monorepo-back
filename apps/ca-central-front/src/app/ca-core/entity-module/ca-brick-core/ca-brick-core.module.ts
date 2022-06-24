import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CaBrickVersionSelectOptionsComponent
} from './component/ca-brick-version-select-options/ca-brick-version-select-options.component';
import {CaCoreModule} from '../../ca-core.module';
import {CaBrickSelectOptionsComponent} from './component/ca-brick-select-options/ca-brick-select-options.component';
import {
  CaBrickVersionDetailDialogComponent
} from './component/ca-brick-version-detail-dialog/ca-brick-version-detail-dialog.component';
import {CaBrickVersionDetailComponent} from './component/ca-brick-version-detail/ca-brick-version-detail.component';


@NgModule({
  declarations: [
    CaBrickVersionSelectOptionsComponent,
    CaBrickSelectOptionsComponent,
    CaBrickVersionDetailDialogComponent,
    CaBrickVersionDetailComponent
  ],
  exports: [
    CaBrickVersionSelectOptionsComponent,
    CaBrickSelectOptionsComponent,
    CaBrickVersionDetailDialogComponent,
    CaBrickVersionDetailComponent
  ],
  imports: [
    CommonModule,

    CaCoreModule,
  ],
})
export class CaBrickCoreModule { }
