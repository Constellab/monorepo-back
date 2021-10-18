import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomMaterialModule} from './custom-material/custom-material.module';
import {CustomLibraryModule} from './custom-library/custom-library.module';
import {QuillModule} from 'ngx-quill';
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

    QuillModule,

    // Directives
    LabEnvDevDirective,
  ]
})
export class CoreModule { }
