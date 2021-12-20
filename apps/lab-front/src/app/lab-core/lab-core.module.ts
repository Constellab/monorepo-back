import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCustomMaterialModule} from './lab-custom-material/lab-custom-material.module';
import {LabCustomLibraryModule} from './lab-custom-library/lab-custom-library.module';
import {LabEnvDevDirective} from './directive/lab-env-dev.directive';


@NgModule({
  declarations: [
    // Directives
    LabEnvDevDirective
  ],
  imports: [
    CommonModule,

    LabCustomMaterialModule,
    LabCustomLibraryModule,
  ],
  exports: [
    LabCustomMaterialModule,
    LabCustomLibraryModule,

    // Directives
    LabEnvDevDirective,
  ]
})
export class LabCoreModule { }
