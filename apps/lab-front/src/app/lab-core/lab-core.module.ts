import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCustomMaterialModule} from './lab-custom-material/lab-custom-material.module';
import {LabCustomLibraryModule} from './lab-custom-library/lab-custom-library.module';
import {LabEnvDevDirective} from './directive/lab-env-dev.directive';
import {LabCorePipeModule} from './lab-core-pipe/lab-core-pipe.module';


@NgModule({
  declarations: [
    // Directives
    LabEnvDevDirective,

  ],
  exports: [
    LabCustomMaterialModule,
    LabCustomLibraryModule,
    LabCorePipeModule,

    // Directives
    LabEnvDevDirective,

  ],
  imports: [
    CommonModule,

    LabCustomMaterialModule,
    LabCustomLibraryModule,
    LabCorePipeModule,
  ],
})
export class LabCoreModule {
}
