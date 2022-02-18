import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CaBrickVersionSelectOptionsComponent
} from './component/ca-brick-version-select-options/ca-brick-version-select-options.component';
import {CaCoreModule} from '../../ca-core.module';


@NgModule({
  declarations: [
    CaBrickVersionSelectOptionsComponent
  ],
  exports: [
    CaBrickVersionSelectOptionsComponent
  ],
  imports: [
    CommonModule,

    CaCoreModule,
  ],
})
export class CaBrickCoreModule { }
