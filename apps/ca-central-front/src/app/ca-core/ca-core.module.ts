import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreComponentModule} from './module/ca-core-component/ca-core-component.module';
import {CaCustomMaterialModule} from './custom-material/ca-custom-material.module';
import {CaCoreSelectModule} from './module/ca-core-select/ca-core-select.module';
import {CaStatusModule} from './module/ca-status/ca-status.module';
import {CaUserCoreModule} from './entity-module/ca-user-core/ca-user-core.module';
import {CaCustomLibraryModule} from './custom-library/ca-custom-library.module';
import {CaCoreDirectiveModule} from './module/ca-core-directive/ca-core-directive.module';

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
    CaCoreComponentModule,
    CaCoreDirectiveModule,

    // other modules
    CaCoreSelectModule,
    CaStatusModule,
    CaUserCoreModule,

    // Material Module
    CaCustomMaterialModule,

    // Library
    CaCustomLibraryModule,
  ]
})
export class CaCoreModule {
}
