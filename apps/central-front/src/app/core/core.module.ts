import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreComponentModule} from './module/core-component/core-component.module';
import {CustomMaterialModule} from './custom-material/custom-material.module';
import {CoreSelectModule} from './module/core-select/core-select.module';
import {QuillModule} from 'ngx-quill';
import {StatusModule} from './module/status/status.module';
import {UserCoreModule} from './entity-module/user-core/user-core.module';
import {CustomLibraryModule} from './custom-library/custom-library.module';

/**
 * Core module of the app containing, component, services, directives and pipes
 * shared across the application
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [
    // export all core modules
    CoreComponentModule,

    // other modules
    CoreSelectModule,
    StatusModule,
    UserCoreModule,

    // Material Module
    CustomMaterialModule,

    // Library
    CustomLibraryModule,

    // Quill
    QuillModule,
  ]
})
export class CoreModule {
}
