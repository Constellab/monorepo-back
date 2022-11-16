import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaSyncObjectInfoComponent} from './component/ca-sync-object-info/ca-sync-object-info.component';
import {CaValidatedObjectInfoComponent} from './component/ca-validated-object-info/ca-validated-object-info.component';
import {
  CaProjectObjectBreadcrumbComponent
} from './component/ca-project-object-breadcrumb/ca-project-object-breadcrumb.component';
import {CaProjectObjectQueryParamsPipe} from './pipe/ca-project-object-query-params.pipe';

/**
 * Module that contains components for the project, experiment and report objects
 */
@NgModule({
  declarations: [
    CaSyncObjectInfoComponent,
    CaValidatedObjectInfoComponent,
    CaProjectObjectBreadcrumbComponent,
    CaProjectObjectQueryParamsPipe,
  ],
  exports: [
    CaSyncObjectInfoComponent,
    CaValidatedObjectInfoComponent,
    CaProjectObjectBreadcrumbComponent,
    CaProjectObjectQueryParamsPipe,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
  ]
})
export class CaProjectObjectCoreModule {
}
