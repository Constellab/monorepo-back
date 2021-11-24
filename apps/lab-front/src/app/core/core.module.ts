import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomMaterialModule} from './custom-material/custom-material.module';
import {CustomLibraryModule} from './custom-library/custom-library.module';
import {LabEnvDevDirective} from './directive/lab-env-dev.directive';


@NgModule({
  declarations: [
    // Directives
    LabEnvDevDirective
  ],
  imports: [
    CommonModule,

    CustomMaterialModule,
    CustomLibraryModule,
  ],
  exports: [
    CustomMaterialModule,
    CustomLibraryModule,

    // Directives
    LabEnvDevDirective,
  ]
})
export class CoreModule { }
