import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {BioxResourceCoreModule} from '../../../core/entity-module/biox-resource-core/biox-resource-core.module';
import {BioxResourceDetailPageComponent} from './component/biox-resource-detail-page/biox-resource-detail-page.component';
import {RouterModule} from '@angular/router';
import {BioxResourceViewSpecsComponent} from './component/biox-resource-view-specs/biox-resource-view-specs.component';
import {BioxResourceViewSpecsPortalComponent} from './component/biox-resource-view-specs-portal/biox-resource-view-specs-portal.component';
import {BioxConfigureResourceViewComponent} from './component/biox-configure-resource-view/biox-configure-resource-view.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BioxConfigCoreModule} from '../../../core/entity-module/biox-config-core/biox-config-core.module';

/**
 * Simple module for the resource detail page
 */
@NgModule({
  declarations: [
    BioxResourceDetailPageComponent,
    BioxResourceViewSpecsComponent,
    BioxResourceViewSpecsPortalComponent,
    BioxConfigureResourceViewComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
    BioxResourceCoreModule,
    BioxConfigCoreModule,
  ]
})
export class BioxResourceDetailPageModule {
}
