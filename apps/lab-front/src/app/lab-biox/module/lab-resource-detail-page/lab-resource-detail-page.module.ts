import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {LabResourceCoreModule} from '../../../lab-core/entity-module/lab-resource-core/lab-resource-core.module';
import {LabResourceDetailPageComponent} from './component/lab-resource-detail-page/lab-resource-detail-page.component';
import {RouterModule} from '@angular/router';
import {LabResourceViewSpecsComponent} from './component/lab-resource-view-specs/lab-resource-view-specs.component';
import {
  LabResourceViewSpecsPortalComponent
} from './component/lab-resource-view-specs-portal/lab-resource-view-specs-portal.component';
import {
  LabConfigureResourceViewComponent
} from './component/lab-configure-resource-view/lab-configure-resource-view.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabConfigCoreModule} from '../../../lab-core/entity-module/lab-config-core/lab-config-core.module';
import {LabTransformerModule} from '../../../lab-core/entity-module/lab-transformer/lab-transformer.module';

/**
 * Simple module for the resource detail page
 */
@NgModule({
  declarations: [
    LabResourceDetailPageComponent,
    LabResourceViewSpecsComponent,
    LabResourceViewSpecsPortalComponent,
    LabConfigureResourceViewComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    LabCoreModule,
    LabResourceCoreModule,
    LabConfigCoreModule,
    LabTransformerModule,
  ]
})
export class LabResourceDetailPageModule {
}
