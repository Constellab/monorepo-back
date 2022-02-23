import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CaBrickVersionSelectOptionsComponent
} from './component/ca-brick-version-select-options/ca-brick-version-select-options.component';
import {CaCoreModule} from '../../ca-core.module';
import {CaBrickSelectOptionsComponent} from './component/ca-brick-select-options/ca-brick-select-options.component';


@NgModule({
  declarations: [
    CaBrickVersionSelectOptionsComponent,
    CaBrickSelectOptionsComponent
  ],
  exports: [
    CaBrickVersionSelectOptionsComponent,
    CaBrickSelectOptionsComponent
  ],
  imports: [
    CommonModule,

    CaCoreModule,
  ],
})
export class CaBrickCoreModule { }
